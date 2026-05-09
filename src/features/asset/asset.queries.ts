import { getServiceContext } from "@/lib/service-context"
import { assetRepository } from "@/features/asset/asset.repository"

export const assetQueries = {
    async listWorkspaceAssets({
        userId,
        workspaceId,
    }: {
        userId: string
        workspaceId: string
    }) {
        const ctx = await getServiceContext(userId, workspaceId)

        return assetRepository.listActive(ctx.membership.workspaceId)
    },
}
