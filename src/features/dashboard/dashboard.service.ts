/**
 * Dashboard service — thin pass-through to dashboardQueries.
 * Auth is enforced at the query layer; this file remains for
 * API symmetry with other feature services.
 */

import { dashboardQueries } from "@/features/dashboard/dashboard.queries"

export async function getWorkOrderCount(userId: string, workspaceId: string) {
    return dashboardQueries.getWorkOrderCount({ userId, workspaceId })
}

export async function getAssetCount(userId: string, workspaceId: string) {
    return dashboardQueries.getAssetCount({ userId, workspaceId })
}


export async function getMemberCount(userId: string, workspaceId: string) {
    return dashboardQueries.getMemberCount({ userId, workspaceId })
}
