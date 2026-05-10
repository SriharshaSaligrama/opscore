import { getServiceContext } from "@/lib/service-context"
import { Permission } from "@/features/authorization/permissions"
import { ensureWorkspaceEntity } from "@/lib/workspace-entity-guards"
import { CATEGORY_NAME_MAX_LENGTH } from "@/features/asset-category/asset-category.schemas"
import { validateEntityName } from "@/lib/name-validation"
import { domainEvents } from "@/features/domain-events/domain-event.builders"
import { runWorkspaceMutation } from "@/lib/service-mutation"
import { assetCategoryRepository } from "@/features/asset-category/asset-category.repository"
import { ConflictError } from "@/lib/errors"

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
        const ctx = await getServiceContext(userId, workspaceId, Permission.CREATE_CATEGORY)

        name = name.trim()
        validateEntityName(name, { label: "Category", max: CATEGORY_NAME_MAX_LENGTH })

        const existing = await assetCategoryRepository.findActiveByName(
            ctx.membership.workspaceId,
            name
        )

        if (existing) throw new ConflictError("Category already exists")

        return runWorkspaceMutation(
            async (db) => {
                return db.assetCategory.create({
                    data: {
                        name,
                        workspaceId: ctx.membership.workspaceId,
                    },
                })
            },
            {
                uniqueConflictMessage: "Category already exists",
                event: (category) =>
                    domainEvents.categoryCreated({
                        workspaceId: ctx.membership.workspaceId,
                        actorId: ctx.membership.userId,
                        categoryId: category.id,
                        name,
                    }),
            }
        )
    },

    async listCategories({
        userId,
        workspaceId,
    }: {
        userId: string
        workspaceId: string
    }) {
        const ctx = await getServiceContext(userId, workspaceId)
        return assetCategoryRepository.listActive(ctx.membership.workspaceId)
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
        const ctx = await getServiceContext(userId, workspaceId, Permission.UPDATE_CATEGORY)

        return runWorkspaceMutation(
            async (db) => {
                const category = await assetCategoryRepository.findById(categoryId, db)

                ensureWorkspaceEntity(category, ctx.membership.workspaceId, {
                    notFoundMessage: "Category not found",
                    invalidWorkspaceMessage: "Invalid category",
                    archivedMessage: "Cannot update archived category",
                })

                name = name.trim()
                validateEntityName(name, { label: "Category", max: CATEGORY_NAME_MAX_LENGTH })

                const conflict = await assetCategoryRepository.findActiveByNameExcluding(
                    ctx.membership.workspaceId,
                    name,
                    categoryId,
                    db
                )

                if (conflict) throw new ConflictError("Category already exists")

                return db.assetCategory.update({
                    where: { id: categoryId },
                    data: { name },
                })
            },
            {
                uniqueConflictMessage: "Category already exists",
                event: () =>
                    domainEvents.categoryUpdated({
                        workspaceId: ctx.membership.workspaceId,
                        actorId: ctx.membership.userId,
                        categoryId,
                        name,
                    }),
            }
        )
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
        const ctx = await getServiceContext(userId, workspaceId, Permission.ARCHIVE_CATEGORY)

        const category = await assetCategoryRepository.findByIdWithActiveAssets(categoryId)

        const existingCategory = ensureWorkspaceEntity(category, ctx.membership.workspaceId, {
            notFoundMessage: "Category not found",
            invalidWorkspaceMessage: "Invalid category",
        })

        if (existingCategory.isDeleted) return existingCategory

        if (existingCategory.assets.length > 0) {
            throw new ConflictError("Cannot archive category with active assets")
        }

        return runWorkspaceMutation(
            async (db) => assetCategoryRepository.softDelete(categoryId, db),
            {
                event: () =>
                    domainEvents.categoryArchived({
                        workspaceId: ctx.membership.workspaceId,
                        actorId: ctx.membership.userId,
                        categoryId,
                    }),
            }
        )
    },
}
