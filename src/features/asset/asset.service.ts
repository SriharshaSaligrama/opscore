import { prisma } from "@/lib/prisma"
import { getServiceContext } from "@/lib/service-context"
import { Permission } from "@/features/authorization/permissions"
import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
} from "@/lib/errors"
import { AssetStatus, Prisma } from "@prisma/client"

const ASSET_NAME_MAX_LENGTH = 30

function isUniqueConstraintError(error: unknown) {
    return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
    )
}

export const assetService = {
    async createAsset({
        userId,
        workspaceId,
        name,
        categoryId,
    }: {
        userId: string
        workspaceId: string
        name: string
        categoryId: string
    }) {
        const ctx = await getServiceContext(
            userId,
            workspaceId,
            Permission.CREATE_ASSET
        )

        name = name.trim()

        if (!name) {
            throw new BadRequestError("Asset name is required")
        }

        if (name.length > ASSET_NAME_MAX_LENGTH) {
            throw new BadRequestError("Asset name too long")
        }

        const category = await prisma.assetCategory.findUnique({
            where: { id: categoryId },
        })

        if (!category) {
            throw new NotFoundError("Category not found")
        }

        if (category.workspaceId !== ctx.membership.workspaceId) {
            throw new ForbiddenError("Invalid category")
        }

        if (category.isDeleted) {
            throw new ForbiddenError("Cannot create asset in archived category")
        }

        const existing = await prisma.asset.findFirst({
            where: {
                workspaceId: ctx.membership.workspaceId,
                name: { equals: name, mode: "insensitive" },
                isDeleted: false,
            },
        })

        if (existing) {
            throw new ConflictError("Asset already exists")
        }

        try {
            return await prisma.asset.create({
                data: {
                    name,
                    categoryId,
                    workspaceId: ctx.membership.workspaceId,
                    createdBy: ctx.membership.userId,
                },
                include: {
                    category: true,
                },
            })
        } catch (error) {
            if (isUniqueConstraintError(error)) {
                throw new ConflictError("Asset already exists")
            }

            throw error
        }
    },

    async listAssets({
        userId,
        workspaceId,
    }: {
        userId: string
        workspaceId: string
    }) {
        const ctx = await getServiceContext(userId, workspaceId)

        return prisma.asset.findMany({
            where: {
                workspaceId: ctx.membership.workspaceId,
                isDeleted: false, // ✅ soft delete enforced
            },
            orderBy: { createdAt: "asc" },
            include: { category: true },
        })
    },

    async updateAsset({
        userId,
        workspaceId,
        assetId,
        name,
        categoryId,
        status,
    }: {
        userId: string
        workspaceId: string
        assetId: string
        name?: string
        categoryId?: string
        status?: AssetStatus
    }) {
        const ctx = await getServiceContext(
            userId,
            workspaceId,
            Permission.UPDATE_ASSET
        )

        const asset = await prisma.asset.findUnique({
            where: { id: assetId },
        })

        if (!asset) throw new NotFoundError("Asset not found")

        if (asset.workspaceId !== ctx.membership.workspaceId) {
            throw new ForbiddenError("Invalid asset")
        }

        if (asset.isDeleted) {
            throw new ForbiddenError("Cannot update archived asset")
        }

        let shouldCheckNameConflict = false

        if (name !== undefined) {
            name = name.trim()

            if (!name) {
                throw new BadRequestError("Asset name cannot be empty")
            }

            if (name.length > ASSET_NAME_MAX_LENGTH) {
                throw new BadRequestError("Asset name too long")
            }

            if (name !== asset.name) {
                shouldCheckNameConflict = true
            }
        }

        if (categoryId !== undefined) {
            const category = await prisma.assetCategory.findUnique({
                where: { id: categoryId },
            })

            if (!category) {
                throw new NotFoundError("Category not found")
            }

            if (category.workspaceId !== ctx.membership.workspaceId) {
                throw new ForbiddenError("Invalid category")
            }

            if (category.isDeleted) {
                throw new ForbiddenError("Cannot move asset to archived category")
            }
        }

        if (shouldCheckNameConflict) {
            const exisiting = await prisma.asset.findFirst({
                where: {
                    workspaceId: ctx.membership.workspaceId,
                    name: { equals: name, mode: "insensitive" },
                    NOT: { id: assetId },
                    isDeleted: false,
                },
            })

            if (exisiting) {
                throw new ConflictError("Asset already exists")
            }
        }

        if (status !== undefined) {
            if (!Object.values(AssetStatus).includes(status)) {
                throw new BadRequestError("Invalid asset status")
            }
        }

        try {
            return await prisma.asset.update({
                where: { id: assetId },
                data: {
                    ...(name !== undefined && { name }),
                    ...(categoryId !== undefined && { categoryId }),
                    ...(status !== undefined && { status }),
                },
            })
        } catch (error) {
            if (isUniqueConstraintError(error)) {
                throw new ConflictError("Asset already exists")
            }

            throw error
        }
    },

    async archiveAsset({
        userId,
        workspaceId,
        assetId,
    }: {
        userId: string
        workspaceId: string
        assetId: string
    }) {
        const ctx = await getServiceContext(
            userId,
            workspaceId,
            Permission.ARCHIVE_ASSET
        )

        const asset = await prisma.asset.findUnique({
            where: { id: assetId },
            include: {
                workOrders: {
                    where: { isDeleted: false },
                    select: {
                        id: true,
                    },
                }
            },
        })

        if (!asset) throw new NotFoundError("Asset not found")

        if (asset.workspaceId !== ctx.membership.workspaceId) {
            throw new ForbiddenError("Invalid asset")
        }

        if (asset.isDeleted) return asset

        if (asset.workOrders.length > 0) {
            throw new ConflictError(
                "Asset cannot be deleted because it has active work orders"
            )
        }

        return prisma.asset.update({
            where: { id: assetId },
            data: { isDeleted: true },
        })
    },
}
