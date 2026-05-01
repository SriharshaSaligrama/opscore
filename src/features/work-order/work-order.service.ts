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

import { getServiceContext } from "@/lib/service-context"
import { BadRequestError } from "@/lib/errors"

import { domainEventService } from "@/features/domain-events/domain-event.service"
import { domainEvents } from "@/features/domain-events/domain-event.builders"
import { runWorkspaceMutation } from "@/lib/service-mutation"

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
        return runWorkspaceMutation(async (db) => {
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

            return workOrder
        }, {
            event: (workOrder, db) => domainEventService.record({
                db,
                ...domainEvents.workOrderCreated({
                    workspaceId,
                    actorId: userId,
                    workOrderId: workOrder.id,
                }),
            }),
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
        return runWorkspaceMutation(async (db) => {
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
                    throw new BadRequestError("assigneeId required")
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

            return {
                updated,
                previousStatus: workOrder.status,
                newStatus: nextStatus,
            }
        }, {
            event: ({ previousStatus, newStatus }, db) => domainEventService.record({
                db,
                ...domainEvents.workOrderAction({
                    workspaceId,
                    actorId: userId,
                    workOrderId,
                    action,
                    previousStatus,
                    newStatus,
                    assigneeId,
                }),
            }),
        }).then(({ updated }) => updated)
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
        return runWorkspaceMutation(async (db) => {
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
                return { workOrder, archived: false }
            }

            const updated = await db.workOrder.update({
                where: { id: workOrderId },
                data: { isDeleted: true },
            })

            return { workOrder: updated, archived: true }
        }, {
            event: ({ archived }, db) => archived
                ? domainEventService.record({
                    db,
                    ...domainEvents.workOrderArchived({
                        workspaceId,
                        actorId: userId,
                        workOrderId,
                    }),
                })
                : Promise.resolve(),
        }).then(({ workOrder }) => workOrder)
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

        return runWorkspaceMutation(async (db) => {

            const ctx = await getServiceContext(userId, workspaceId)

            await getWorkOrderOrThrow(
                db,
                workOrderId,
                ctx.membership.workspaceId
            )

            return domainEventService.record({
                db,
                ...domainEvents.commentAdded({
                    workspaceId: ctx.membership.workspaceId,
                    actorId: ctx.membership.userId,
                    workOrderId,
                    message,
                }),
            })

        })
    }
}
