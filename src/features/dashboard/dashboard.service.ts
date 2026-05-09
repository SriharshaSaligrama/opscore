import { dashboardQueries } from "@/features/dashboard/dashboard.queries"

export async function getWorkOrderCount(workspaceId: string) {
    return dashboardQueries.getWorkOrderCount(workspaceId)
}

export async function getAssetCount(workspaceId: string) {
    return dashboardQueries.getAssetCount(workspaceId)
}

export async function getMemberCount(workspaceId: string) {
    return dashboardQueries.getMemberCount(workspaceId)
}
