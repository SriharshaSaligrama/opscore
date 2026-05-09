import { DB } from "@/lib/db"
import { ForbiddenError } from "@/lib/errors"
import { ensureWorkspaceEntity } from "@/lib/workspace-entity-guards"
import { prisma } from "@/lib/prisma"

export const workOrderRepository = {
    findById(workOrderId: string, db: DB = prisma) {
        return db.workOrder.findUnique({
            where: { id: workOrderId },
        })
    },

    listActive(workspaceId: string, db: DB = prisma) {
        return db.workOrder.findMany({
            where: {
                workspaceId,
                isDeleted: false,
            },
            orderBy: {
                createdAt: "asc",
            },
        })
    },

    async assertActiveInWorkspace(workOrderId: string, workspaceId: string, db: DB = prisma) {
        const workOrder = await db.workOrder.findUnique({
            where: { id: workOrderId },
        })

        return ensureWorkspaceEntity(workOrder, workspaceId, {
            notFoundMessage: "Work order not found",
            invalidWorkspaceMessage: "Work order does not belong to workspace",
            archivedMessage: "Work order is archived",
        })
    },

    async assertAssetActiveInWorkspace(assetId: string, workspaceId: string, db: DB = prisma) {
        const asset = await db.asset.findUnique({
            where: { id: assetId },
        })

        return ensureWorkspaceEntity(asset, workspaceId, {
            notFoundMessage: "Asset not found",
            invalidWorkspaceMessage: "Asset does not belong to workspace",
            archivedMessage: "Cannot create work order for archived asset",
        })
    },

    async ensureUserInWorkspace(userId: string, workspaceId: string, db: DB = prisma) {
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
    },
}
