import { WorkOrderPermissions } from "./work-order.permissions"

import { workOrderRepository } from "./work-order.repository"

import {
    executeTransition,
    WorkOrderAction,
} from "./work-order.state-machine"

import { getServiceContext } from "@/lib/service-context"
import { BadRequestError } from "@/lib/errors"

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
                WorkOrderPermissions.create,
                db
            )

            await workOrderRepository.assertAssetActiveInWorkspace(
                assetId,
                ctx.membership.workspaceId,
                db
            )

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
            event: (workOrder) => domainEvents.workOrderCreated({
                    workspaceId,
                    actorId: userId,
                    workOrderId: workOrder.id,
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
                workspaceId,
                undefined,
                db
            )

            const workOrder = await workOrderRepository.assertActiveInWorkspace(
                workOrderId,
                ctx.membership.workspaceId,
                db
            )

            if (action === "assign") {

                if (!assigneeId) {
                    throw new BadRequestError("assigneeId required")
                }

                await workOrderRepository.ensureUserInWorkspace(
                    assigneeId,
                    ctx.membership.workspaceId,
                    db
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
            event: ({ previousStatus, newStatus }) => domainEvents.workOrderAction({
                    workspaceId,
                    actorId: userId,
                    workOrderId,
                    action,
                    previousStatus,
                    newStatus,
                    assigneeId,
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

        return workOrderRepository.listActive(ctx.membership.workspaceId)
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
                WorkOrderPermissions.update,
                db
            )

            const workOrder = await workOrderRepository.assertActiveInWorkspace(
                workOrderId,
                ctx.membership.workspaceId,
                db
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
            event: ({ archived }) => archived
                ? domainEvents.workOrderArchived({
                        workspaceId,
                        actorId: userId,
                        workOrderId,
                })
                : undefined,
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

            const ctx = await getServiceContext(userId, workspaceId, undefined, db)

            await workOrderRepository.assertActiveInWorkspace(
                workOrderId,
                ctx.membership.workspaceId,
                db
            )

            return {
                workspaceId: ctx.membership.workspaceId,
                actorId: ctx.membership.userId,
            }

        }, {
            event: ({ workspaceId, actorId }) => domainEvents.commentAdded({
                workspaceId,
                actorId,
                workOrderId,
                message,
            }),
        })
    }
}
