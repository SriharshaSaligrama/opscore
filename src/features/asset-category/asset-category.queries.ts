import { getServiceContext } from "@/lib/service-context"
import { assetCategoryRepository } from "@/features/asset-category/asset-category.repository"

export const assetCategoryQueries = {
    async listWorkspaceCategories({
        userId,
        workspaceId,
    }: {
        userId: string
        workspaceId: string
    }) {
        const ctx = await getServiceContext(userId, workspaceId)

        return assetCategoryRepository.listActive(ctx.membership.workspaceId)
    },
}
