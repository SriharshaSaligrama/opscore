import { dashboardRepository } from "@/features/dashboard/dashboard.repository"

export const dashboardQueries = {
    getWorkOrderCount(workspaceId: string) {
        return dashboardRepository.countActiveWorkOrders(workspaceId)
    },

    getAssetCount(workspaceId: string) {
        return dashboardRepository.countActiveAssets(workspaceId)
    },

    getMemberCount(workspaceId: string) {
        return dashboardRepository.countMembers(workspaceId)
    },
}
