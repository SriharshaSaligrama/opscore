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

import { domainEventService } from "@/features/domain-events/domain-event.service"
import { DomainEventType } from "@/features/domain-events/domain-event.types"
import { DomainEntityType } from "@prisma/client"

function mapActionToEventType(action: WorkOrderAction): DomainEventType {
    switch (action) {
        case "assign": return DomainEventType.WORK_ORDER_ASSIGNED
        case "start": return DomainEventType.WORK_ORDER_STARTED
        case "complete": return DomainEventType.WORK_ORDER_COMPLETED
        case "close": return DomainEventType.WORK_ORDER_CLOSED
        default: throw new Error(`Unknown action: ${action}`)
    }
}

function mapActionToMessage(
    action: WorkOrderAction,
): string {
    switch (action) {
        case "assign":
            return "Work order assigned"
        case "start":
            return "Work started"
        case "complete":
            return "Work completed"
        case "close":
            return "Work order closed"
        default:
            throw new Error(`Unknown action: ${action}`)
    }
}

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

            const workOrder = await db.workOrder.create({
                data: {
                    workspaceId: ctx.membership.workspaceId,
                    assetId,
                    description,
                    priority,
                    createdBy: ctx.membership.userId,
                },
            })

            await domainEventService.record({
                db,
                workspaceId: ctx.membership.workspaceId,
                entityType: DomainEntityType.WORK_ORDER,
                entityId: workOrder.id,
                actorId: ctx.membership.userId,
                type: DomainEventType.WORK_ORDER_CREATED,
                message: "Work order created",
            })

            return workOrder
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

            const updated = await db.workOrder.update({
                where: { id: workOrderId },
                data: {
                    status: nextStatus,
                    ...(action === "assign" && {
                        assignedTo: assigneeId,
                    }),
                },
            })

            await domainEventService.record({
                db,
                workspaceId: ctx.membership.workspaceId,
                entityType: DomainEntityType.WORK_ORDER,
                entityId: workOrderId,
                actorId: ctx.membership.userId,
                type: mapActionToEventType(action),
                message: mapActionToMessage(action),
                metadata: {
                    action,
                    previousStatus: workOrder.status,
                    newStatus: nextStatus,
                    ...(assigneeId && { assigneeId }),
                },
            })

            return updated
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

            const updated = await db.workOrder.update({
                where: { id: workOrderId },
                data: { isDeleted: true },
            })

            await domainEventService.record({
                db,
                workspaceId: ctx.membership.workspaceId,
                entityType: DomainEntityType.WORK_ORDER,
                entityId: workOrderId,
                actorId: ctx.membership.userId,
                type: DomainEventType.WORK_ORDER_ARCHIVED,
                message: "Work order archived",
            })

            return updated
        })
    },

    async addComment({
        userId,
        workspaceId,
        workOrderId,
        message,
    }: {
        userId: string
        workspaceId: string
        workOrderId: string
        message: string
    }) {

        return withTransaction(async (db) => {

            const ctx = await getServiceContext(userId, workspaceId)

            await getWorkOrderOrThrow(
                db,
                workOrderId,
                ctx.membership.workspaceId
            )

            return domainEventService.record({
                db,
                workspaceId: ctx.membership.workspaceId,
                entityType: DomainEntityType.WORK_ORDER,
                entityId: workOrderId,
                actorId: ctx.membership.userId,
                type: DomainEventType.COMMENT_ADDED,
                message,
            })

        })
    }
}