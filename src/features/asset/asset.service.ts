import { getServiceContext } from "@/lib/service-context"
import { Permission } from "@/features/authorization/permissions"
import { ensureWorkspaceEntity } from "@/lib/workspace-entity-guards"
import { ASSET_NAME_MAX_LENGTH } from "@/features/asset/asset.schemas"
import { validateEntityName } from "@/lib/name-validation"
import { domainEvents } from "@/features/domain-events/domain-event.builders"
import {
    runWorkspaceMutation,
    runWorkspaceMutationWithContext,
} from "@/lib/service-mutation"
import { assetRepository } from "@/features/asset/asset.repository"
import { assetCategoryRepository } from "@/features/asset-category/asset-category.repository"
import { BadRequestError, ConflictError } from "@/lib/errors"
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
        name = name.trim()
        validateEntityName(name, { label: "Asset", max: ASSET_NAME_MAX_LENGTH })

        return runWorkspaceMutationWithContext({
            userId,
            workspaceId,
            permission: Permission.CREATE_ASSET,
            uniqueConflictMessage: "Asset already exists",
            mutation: async (ctx, db) => {
                const category = await assetCategoryRepository.findById(categoryId, db)

                ensureWorkspaceEntity(category, ctx.membership.workspaceId, {
                    notFoundMessage: "Category not found",
                    invalidWorkspaceMessage: "Invalid category",
                    archivedMessage: "Cannot create asset in archived category",
                })

                const existing = await assetRepository.findActiveByName(
                    ctx.membership.workspaceId,
                    name,
                    db
                )

                if (existing) {
                    throw new ConflictError("Asset already exists")
                }

                return db.asset.create({
                    data: {
                        name,
                        categoryId,
                        workspaceId: ctx.membership.workspaceId,
                        createdBy: ctx.membership.userId,
                    },
                    include: { category: true },
                })
            },
            event: (asset, ctx) =>
                domainEvents.assetCreated({
                    workspaceId: ctx.membership.workspaceId,
                    actorId: ctx.membership.userId,
                    assetId: asset.id,
                    name,
                    categoryId,
                }),
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
        return assetRepository.listActive(ctx.membership.workspaceId)
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
        const ctx = await getServiceContext(userId, workspaceId, Permission.UPDATE_ASSET)

        const asset = await assetRepository.findById(assetId)

        const existingAsset = ensureWorkspaceEntity(asset, ctx.membership.workspaceId, {
            notFoundMessage: "Asset not found",
            invalidWorkspaceMessage: "Invalid asset",
            archivedMessage: "Cannot update archived asset",
        })

        let shouldCheckNameConflict = false

        if (name !== undefined) {
            name = name.trim()
            validateEntityName(name, { label: "Asset", max: ASSET_NAME_MAX_LENGTH })

            if (name !== existingAsset.name) {
                shouldCheckNameConflict = true
            }
        }

        if (categoryId !== undefined) {
            const category = await assetCategoryRepository.findById(categoryId)

            ensureWorkspaceEntity(category, ctx.membership.workspaceId, {
                notFoundMessage: "Category not found",
                invalidWorkspaceMessage: "Invalid category",
                archivedMessage: "Cannot move asset to archived category",
            })
        }

        if (shouldCheckNameConflict) {
            const conflict = await assetRepository.findActiveByNameExcluding(
                ctx.membership.workspaceId,
                name!,
                assetId
            )

            if (conflict) {
                throw new ConflictError("Asset already exists")
            }
        }

        if (status !== undefined && !Object.values(AssetStatus).includes(status)) {
            throw new BadRequestError("Invalid asset status")
        }

        const metadata = {
            ...(name !== undefined && { name }),
            ...(categoryId !== undefined && { categoryId }),
            ...(status !== undefined && { status }),
        }

        return runWorkspaceMutation(
            async (db) => {
                return db.asset.update({
                    where: { id: assetId },
                    data: metadata,
                })
            },
            {
                uniqueConflictMessage: "Asset already exists",
                event: () =>
                    domainEvents.assetUpdated({
                        workspaceId: ctx.membership.workspaceId,
                        actorId: ctx.membership.userId,
                        assetId,
                        metadata,
                    }),
            }
        )
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
        const ctx = await getServiceContext(userId, workspaceId, Permission.ARCHIVE_ASSET)

        const asset = await assetRepository.findByIdWithActiveWorkOrders(assetId)

        const existingAsset = ensureWorkspaceEntity(asset, ctx.membership.workspaceId, {
            notFoundMessage: "Asset not found",
            invalidWorkspaceMessage: "Invalid asset",
        })

        if (existingAsset.isDeleted) return existingAsset

        if (existingAsset.workOrders.length > 0) {
            throw new ConflictError(
                "Asset cannot be deleted because it has active work orders"
            )
        }

        return runWorkspaceMutation(
            async (db) => assetRepository.softDelete(assetId, db),
            {
                event: () =>
                    domainEvents.assetArchived({
                        workspaceId: ctx.membership.workspaceId,
                        actorId: ctx.membership.userId,
                        assetId,
                    }),
            }
        )
    },
}
