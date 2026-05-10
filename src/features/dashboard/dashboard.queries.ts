/**
 * Dashboard queries.
 *
 * All read paths go through getServiceContext so membership is validated
 * before any data is returned. The dashboard repository provides the raw
 * counting methods; this layer enforces auth.
 */

import { getServiceContext } from "@/lib/service-context"
import { dashboardRepository } from "@/features/dashboard/dashboard.repository"

export const dashboardQueries = {
    async getWorkOrderCount({
        userId,
        workspaceId,
    }: {
        userId: string
        workspaceId: string
    }) {
        const ctx = await getServiceContext(userId, workspaceId)
        return dashboardRepository.countActiveWorkOrders(ctx.membership.workspaceId)
    },

    async getAssetCount({
        userId,
        workspaceId,
    }: {
        userId: string
        workspaceId: string
    }) {
        const ctx = await getServiceContext(userId, workspaceId)
        return dashboardRepository.countActiveAssets(ctx.membership.workspaceId)
    },

    async getMemberCount({
        userId,
        workspaceId,
    }: {
        userId: string
        workspaceId: string
    }) {
        const ctx = await getServiceContext(userId, workspaceId)
        return dashboardRepository.countMembers(ctx.membership.workspaceId)
    },
}
