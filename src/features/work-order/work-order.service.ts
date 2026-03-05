import { prisma } from "@/lib/prisma"

import { WorkOrderPermissions } from "./work-order.permissions"

import {
    getWorkOrderOrThrow,
    getAssetOrThrow,
    ensureUserInWorkspace,
} from "./work-order.repository"

import {
    executeTransition,
    WorkOrderAction,
} from "./work-order.state-machine"
import { withTransaction } from "@/lib/transaction"
import { getServiceContext } from "@/lib/service-context"

export const workOrderService = {

    async createWorkOrder({
        userId,
        workspaceId,
        assetId,
        description,
        priority,
    }: {
        userId: string
        workspaceId: string
        assetId: string
        description?: string
        priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    }) {
        return withTransaction(async (db) => {
            const ctx = await getServiceContext(
                userId,
                workspaceId,
                WorkOrderPermissions.create
            )

            await getAssetOrThrow(db, assetId, ctx.membership.workspaceId)

            return db.workOrder.create({
                data: {
                    workspaceId: ctx.membership.workspaceId,
                    assetId,
                    description,
                    priority,
                    createdBy: ctx.membership.userId,
                },
            })
        })
    },

    async performAction({
        userId,
        workspaceId,
        workOrderId,
        action,
        assigneeId,
    }: {
        userId: string
        workspaceId: string
        workOrderId: string
        action: WorkOrderAction
        assigneeId?: string
    }) {
        return withTransaction(async (db) => {
            const ctx = await getServiceContext(
                userId,
                workspaceId
            )

            const workOrder = await getWorkOrderOrThrow(
                db,
                workOrderId,
                ctx.membership.workspaceId
            )

            if (action === "assign") {

                if (!assigneeId) {
                    throw new Error("assigneeId required")
                }

                await ensureUserInWorkspace(
                    db,
                    assigneeId,
                    ctx.membership.workspaceId
                )
            }

            const nextStatus = executeTransition(
                action,
                workOrder.status,
                ctx.membership.role
            )

            return db.workOrder.update({
                where: { id: workOrderId },
                data: {
                    status: nextStatus,
                    ...(action === "assign" && {
                        assignedTo: assigneeId,
                    }),
                },
            })
        })
    },

    async listWorkOrders({
        userId,
        workspaceId,
    }: {
        userId: string
        workspaceId: string
    }) {

        const ctx = await getServiceContext(userId, workspaceId)

        return prisma.workOrder.findMany({
            where: {
                workspaceId: ctx.membership.workspaceId,
                isDeleted: false,
            },
            orderBy: {
                createdAt: "asc",
            },
        })
    },

    async archiveWorkOrder({
        userId,
        workspaceId,
        workOrderId,
    }: {
        userId: string
        workspaceId: string
        workOrderId: string
    }) {
        return withTransaction(async (db) => {
            const ctx = await getServiceContext(
                userId,
                workspaceId,
                WorkOrderPermissions.update
            )

            const workOrder = await getWorkOrderOrThrow(
                db,
                workOrderId,
                ctx.membership.workspaceId
            )

            if (workOrder.isDeleted) {
                return workOrder
            }

            return db.workOrder.update({
                where: { id: workOrderId },
                data: { isDeleted: true },
            })
        })
    }
}