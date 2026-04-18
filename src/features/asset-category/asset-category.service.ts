import { prisma } from "@/lib/prisma"
import { getServiceContext } from "@/lib/service-context"
import { Permission } from "@/features/authorization/permissions"
import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
} from "@/lib/errors"
import { Prisma } from "@prisma/client"

const CATEGORY_NAME_MAX_LENGTH = 30

function isUniqueConstraintError(error: unknown) {
    return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
    )
}

export const assetCategoryService = {
    async createCategory({
        userId,
        workspaceId,
        name,
    }: {
        userId: string
        workspaceId: string
        name: string
    }) {
        const ctx = await getServiceContext(
            userId,
            workspaceId,
            Permission.CREATE_CATEGORY
        )

        name = name.trim()

        if (!name) throw new BadRequestError("Category name is required")
        if (name.length > CATEGORY_NAME_MAX_LENGTH)
            throw new BadRequestError("Category name too long")

        const existing = await prisma.assetCategory.findFirst({
            where: {
                workspaceId: ctx.membership.workspaceId,
                name: { equals: name, mode: "insensitive" },
                isDeleted: false,
            },
        })

        if (existing) throw new ConflictError("Category already exists")

        try {
            return await prisma.assetCategory.create({
                data: {
                    name,
                    workspaceId: ctx.membership.workspaceId,
                },
            })
        } catch (error) {
            if (isUniqueConstraintError(error)) {
                throw new ConflictError("Category already exists")
            }

            throw error
        }
    },

    async listCategories({
        userId,
        workspaceId,
    }: {
        userId: string
        workspaceId: string
    }) {
        const ctx = await getServiceContext(userId, workspaceId)

        return prisma.assetCategory.findMany({
            where: {
                workspaceId: ctx.membership.workspaceId,
                isDeleted: false,
            },
            orderBy: { createdAt: "asc" },
        })
    },

    async updateCategory({
        userId,
        workspaceId,
        categoryId,
        name,
    }: {
        userId: string
        workspaceId: string
        categoryId: string
        name: string
    }) {
        const ctx = await getServiceContext(
            userId,
            workspaceId,
            Permission.UPDATE_CATEGORY
        )

        const category = await prisma.assetCategory.findUnique({
            where: { id: categoryId },
        })

        if (!category) throw new NotFoundError("Category not found")

        if (category.workspaceId !== ctx.membership.workspaceId) {
            throw new ForbiddenError("Invalid category")
        }

        if (category.isDeleted) {
            throw new ForbiddenError("Cannot update archived category")
        }

        name = name.trim()

        if (!name) throw new BadRequestError("Category name is required")
        if (name.length > CATEGORY_NAME_MAX_LENGTH)
            throw new BadRequestError("Category name too long")

        const existing = await prisma.assetCategory.findFirst({
            where: {
                workspaceId: ctx.membership.workspaceId,
                name: { equals: name, mode: "insensitive" },
                NOT: { id: categoryId },
                isDeleted: false,
            },
        })

        if (existing) throw new ConflictError("Category already exists")

        try {
            return await prisma.assetCategory.update({
                where: { id: categoryId },
                data: { name },
            })
        } catch (error) {
            if (isUniqueConstraintError(error)) {
                throw new ConflictError("Category already exists")
            }

            throw error
        }
    },

    async deleteCategory({
        userId,
        workspaceId,
        categoryId,
    }: {
        userId: string
        workspaceId: string
        categoryId: string
    }) {
        const ctx = await getServiceContext(
            userId,
            workspaceId,
            Permission.ARCHIVE_CATEGORY
        )

        const category = await prisma.assetCategory.findUnique({
            where: { id: categoryId },
            include: {
                assets: {
                    where: { isDeleted: false },
                    select: {
                        id: true,
                    },
                }
            },
        })

        if (!category) throw new NotFoundError("Category not found")

        if (category.workspaceId !== ctx.membership.workspaceId) {
            throw new ForbiddenError("Invalid category")
        }

        if (category.isDeleted) return category

        if (category.assets.length > 0) {
            throw new ConflictError(
                "Cannot archive category with active assets"
            )
        }

        return prisma.assetCategory.update({
            where: { id: categoryId },
            data: { isDeleted: true },
        })
    },
}
