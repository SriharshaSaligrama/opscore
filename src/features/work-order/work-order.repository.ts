import { DB } from "@/lib/db"
import { ForbiddenError } from "@/lib/errors"
import { ensureWorkspaceEntity } from "@/lib/workspace-entity-guards"

export async function getWorkOrderOrThrow(
    db: DB,
    workOrderId: string,
    workspaceId: string
) {
    const workOrder = await db.workOrder.findUnique({
        where: { id: workOrderId },
    })

    return ensureWorkspaceEntity(workOrder, workspaceId, {
        notFoundMessage: "Work order not found",
        invalidWorkspaceMessage: "Work order does not belong to workspace",
        archivedMessage: "Work order is archived",
    })
}

export async function getAssetOrThrow(
    db: DB,
    assetId: string,
    workspaceId: string
) {

    const asset = await db.asset.findUnique({
        where: { id: assetId },
    })

    return ensureWorkspaceEntity(asset, workspaceId, {
        notFoundMessage: "Asset not found",
        invalidWorkspaceMessage: "Asset does not belong to workspace",
        archivedMessage: "Cannot create work order for archived asset",
    })
}

export async function ensureUserInWorkspace(
    db: DB,
    userId: string,
    workspaceId: string
) {

    const membership = await db.membership.findUnique({
        where: {
            userId_workspaceId: {
                userId,
                workspaceId,
            },
        },
    })

    if (!membership) {
        throw new ForbiddenError(
            "User is not part of workspace"
        )
    }

    return membership
}
