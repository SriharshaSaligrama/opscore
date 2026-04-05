import { prisma } from "@/lib/prisma"
import { getServiceContext } from "@/lib/service-context"
import { Permission } from "@/features/authorization/permissions"
import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
} from "@/lib/errors"

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
        if (name.length > 120)
            throw new BadRequestError("Category name too long")

        const existing = await prisma.assetCategory.findFirst({
            where: {
                workspaceId: ctx.membership.workspaceId,
                name,
            },
        })

        if (existing) throw new ConflictError("Category already exists")

        return prisma.assetCategory.create({
            data: {
                name,
                workspaceId: ctx.membership.workspaceId,
            },
        })
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
            where: { workspaceId: ctx.membership.workspaceId },
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

        name = name.trim()

        if (!name) throw new BadRequestError("Category name is required")
        if (name.length > 120)
            throw new BadRequestError("Category name too long")

        const existing = await prisma.assetCategory.findFirst({
            where: {
                workspaceId: ctx.membership.workspaceId,
                name,
                NOT: { id: categoryId },
            },
        })

        if (existing) throw new ConflictError("Category already exists")

        return prisma.assetCategory.update({
            where: { id: categoryId },
            data: { name },
        })
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
                    select: { id: true },
                }
            },
        })

        if (!category) throw new NotFoundError("Category not found")

        if (category.workspaceId !== ctx.membership.workspaceId) {
            throw new ForbiddenError("Invalid category")
        }

        if (category.assets.length > 0) {
            throw new ConflictError(
                "Cannot delete category with existing assets"
            )
        }

        return prisma.assetCategory.delete({
            where: { id: categoryId },
        })
    },
}