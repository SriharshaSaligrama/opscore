import { prisma } from "@/lib/prisma"
import { getServiceContext } from "@/lib/service-context"
import { Permission } from "@/features/authorization/permissions"
import { withTransaction } from "@/lib/transaction"
import { domainEventService } from "@/features/domain-events/domain-event.service"
import { DomainEventType } from "@/features/domain-events/domain-event.types"
import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
} from "@/lib/errors"
import { DomainEntityType, Prisma } from "@prisma/client"

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

        return await withTransaction(async (db) => {
            try {
                const category = await db.assetCategory.create({
                    data: {
                        name,
                        workspaceId: ctx.membership.workspaceId,
                    },
                })

                await domainEventService.record({
                    db,
                    workspaceId: ctx.membership.workspaceId,
                    entityType: DomainEntityType.ASSET_CATEGORY,
                    entityId: category.id,
                    actorId: ctx.membership.userId,
                    type: DomainEventType.CATEGORY_CREATED,
                    message: "Category created",
                    metadata: { name },
                })

                return category
            } catch (error) {
                if (isUniqueConstraintError(error)) {
                    throw new ConflictError("Category already exists")
                }

                throw error
            }
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

        return await withTransaction(async (db) => {
            const category = await db.assetCategory.findUnique({
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

            const existing = await db.assetCategory.findFirst({
                where: {
                    workspaceId: ctx.membership.workspaceId,
                    name: { equals: name, mode: "insensitive" },
                    NOT: { id: categoryId },
                    isDeleted: false,
                },
            })

            if (existing) throw new ConflictError("Category already exists")

            try {
                const updatedCategory = await db.assetCategory.update({
                    where: { id: categoryId },
                    data: { name },
                })

                await domainEventService.record({
                    db,
                    workspaceId: ctx.membership.workspaceId,
                    entityType: DomainEntityType.ASSET_CATEGORY,
                    entityId: categoryId,
                    actorId: ctx.membership.userId,
                    type: DomainEventType.CATEGORY_UPDATED,
                    message: "Category updated",
                    metadata: { name },
                })

                return updatedCategory
            } catch (error) {
                if (isUniqueConstraintError(error)) {
                    throw new ConflictError("Category already exists")
                }

                throw error
            }
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

        return await withTransaction(async (db) => {
            const updatedCategory = await db.assetCategory.update({
                where: { id: categoryId },
                data: { isDeleted: true },
            })

            await domainEventService.record({
                db,
                workspaceId: ctx.membership.workspaceId,
                entityType: DomainEntityType.ASSET_CATEGORY,
                entityId: categoryId,
                actorId: ctx.membership.userId,
                type: DomainEventType.CATEGORY_ARCHIVED,
                message: "Category archived",
            })

            return updatedCategory
        })
    },
}
