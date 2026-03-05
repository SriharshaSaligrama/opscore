import { DB } from "@/lib/db"
import { ForbiddenError, NotFoundError } from "@/lib/errors"

export async function getWorkOrderOrThrow(
    db: DB,
    workOrderId: string,
    workspaceId: string
) {
    const workOrder = await db.workOrder.findUnique({
        where: { id: workOrderId },
    })

    if (!workOrder) {
        throw new NotFoundError("Work order not found")
    }

    if (workOrder.workspaceId !== workspaceId) {
        throw new ForbiddenError(
            "Work order does not belong to workspace"
        )
    }

    if (workOrder.isDeleted) {
        throw new ForbiddenError("Work order is archived")
    }

    return workOrder
}

export async function getAssetOrThrow(
    db: DB,
    assetId: string,
    workspaceId: string
) {

    const asset = await db.asset.findUnique({
        where: { id: assetId },
    })

    if (!asset) {
        throw new NotFoundError("Asset not found")
    }

    if (asset.workspaceId !== workspaceId) {
        throw new ForbiddenError(
            "Asset does not belong to workspace"
        )
    }

    if (asset.isDeleted) {
        throw new ForbiddenError(
            "Cannot create work order for archived asset"
        )
    }

    return asset
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