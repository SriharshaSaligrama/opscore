import { prisma } from "@/lib/prisma"
import { getServiceContext } from "@/lib/service-context"
import { Permission } from "@/features/authorization/permissions"
import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
} from "@/lib/errors"
import { AssetStatus } from "@prisma/client"

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

        if (name.length > 200) {
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

        return prisma.asset.create({
            data: {
                name,
                categoryId,
                workspaceId: ctx.membership.workspaceId,
                createdBy: ctx.membership.userId,
            },
        })
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

            if (name.length > 200) {
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
        }

        if (shouldCheckNameConflict) {
            const exisiting = await prisma.asset.findFirst({
                where: {
                    workspaceId: ctx.membership.workspaceId,
                    name,
                    NOT: { id: assetId },
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

        return prisma.asset.update({
            where: { id: assetId },
            data: {
                ...(name !== undefined && { name }),
                ...(categoryId !== undefined && { categoryId }),
                ...(status !== undefined && { status }),
            },
        })
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
                    select: { id: true },
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
                "Asset cannot be deleted because it has work orders"
            )
        }

        return prisma.asset.update({
            where: { id: assetId },
            data: { isDeleted: true },
        })
    },
}