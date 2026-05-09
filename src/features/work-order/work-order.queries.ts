import { getServiceContext } from "@/lib/service-context"
import { workOrderRepository } from "@/features/work-order/work-order.repository"

export const workOrderQueries = {
    async listWorkspaceWorkOrders({
        userId,
        workspaceId,
    }: {
        userId: string
        workspaceId: string
    }) {
        const ctx = await getServiceContext(userId, workspaceId)

        return workOrderRepository.listActive(ctx.membership.workspaceId)
    },
}
