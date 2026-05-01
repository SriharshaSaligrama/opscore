import { AssetStatus, DomainEntityType, Role, WorkOrderStatus } from "@prisma/client"
import { DomainEventRecordInput } from "@/features/domain-events/domain-event.service"
import { DomainEventType } from "@/features/domain-events/domain-event.types"
import type { WorkOrderAction } from "@/features/work-order/work-order.state-machine"

type EventInput = Omit<DomainEventRecordInput, "db">

export const domainEvents = {
    workspaceCreated({
        workspaceId,
        actorId,
        name,
        source,
    }: {
        workspaceId: string
        actorId: string
        name: string
        source?: string
    }): EventInput {
        return {
            workspaceId,
            entityType: DomainEntityType.WORKSPACE,
            entityId: workspaceId,
            actorId,
            type: DomainEventType.WORKSPACE_CREATED,
            message: "Workspace created",
            metadata: { name, ...(source && { source }) },
        }
    },

    workspaceRenamed({
        workspaceId,
        actorId,
        oldName,
        newName,
    }: {
        workspaceId: string
        actorId: string
        oldName: string
        newName: string
    }): EventInput {
        return {
            workspaceId,
            entityType: DomainEntityType.WORKSPACE,
            entityId: workspaceId,
            actorId,
            type: DomainEventType.WORKSPACE_RENAMED,
            message: "Workspace renamed",
            metadata: { oldName, newName },
        }
    },

    memberAdded({
        workspaceId,
        actorId,
        userId,
        role,
        source,
    }: {
        workspaceId: string
        actorId: string
        userId: string
        role: Role
        source?: string
    }): EventInput {
        return {
            workspaceId,
            entityType: DomainEntityType.MEMBERSHIP,
            entityId: userId,
            actorId,
            type: DomainEventType.MEMBER_ADDED,
            message: source === "signup" ? "Workspace owner added" : "Member added",
            metadata: { role, ...(source && { source }) },
        }
    },

    memberRemoved({
        workspaceId,
        actorId,
        userId,
    }: {
        workspaceId: string
        actorId: string
        userId: string
    }): EventInput {
        return {
            workspaceId,
            entityType: DomainEntityType.MEMBERSHIP,
            entityId: userId,
            actorId,
            type: DomainEventType.MEMBER_REMOVED,
            message: "Member removed",
        }
    },

    memberRoleChanged({
        workspaceId,
        actorId,
        userId,
        newRole,
    }: {
        workspaceId: string
        actorId: string
        userId: string
        newRole: Role
    }): EventInput {
        return {
            workspaceId,
            entityType: DomainEntityType.MEMBERSHIP,
            entityId: userId,
            actorId,
            type: DomainEventType.MEMBER_ROLE_CHANGED,
            message: "Member role changed",
            metadata: { newRole },
        }
    },

    assetCreated({
        workspaceId,
        actorId,
        assetId,
        name,
        categoryId,
    }: {
        workspaceId: string
        actorId: string
        assetId: string
        name: string
        categoryId: string
    }): EventInput {
        return {
            workspaceId,
            entityType: DomainEntityType.ASSET,
            entityId: assetId,
            actorId,
            type: DomainEventType.ASSET_CREATED,
            message: "Asset created",
            metadata: { name, categoryId },
        }
    },

    assetUpdated({
        workspaceId,
        actorId,
        assetId,
        metadata,
    }: {
        workspaceId: string
        actorId: string
        assetId: string
        metadata: {
            name?: string
            categoryId?: string
            status?: AssetStatus
        }
    }): EventInput {
        return {
            workspaceId,
            entityType: DomainEntityType.ASSET,
            entityId: assetId,
            actorId,
            type: DomainEventType.ASSET_UPDATED,
            message: "Asset updated",
            metadata,
        }
    },

    assetArchived({
        workspaceId,
        actorId,
        assetId,
    }: {
        workspaceId: string
        actorId: string
        assetId: string
    }): EventInput {
        return {
            workspaceId,
            entityType: DomainEntityType.ASSET,
            entityId: assetId,
            actorId,
            type: DomainEventType.ASSET_ARCHIVED,
            message: "Asset archived",
        }
    },

    categoryCreated({
        workspaceId,
        actorId,
        categoryId,
        name,
    }: {
        workspaceId: string
        actorId: string
        categoryId: string
        name: string
    }): EventInput {
        return {
            workspaceId,
            entityType: DomainEntityType.ASSET_CATEGORY,
            entityId: categoryId,
            actorId,
            type: DomainEventType.CATEGORY_CREATED,
            message: "Category created",
            metadata: { name },
        }
    },

    categoryUpdated({
        workspaceId,
        actorId,
        categoryId,
        name,
    }: {
        workspaceId: string
        actorId: string
        categoryId: string
        name: string
    }): EventInput {
        return {
            workspaceId,
            entityType: DomainEntityType.ASSET_CATEGORY,
            entityId: categoryId,
            actorId,
            type: DomainEventType.CATEGORY_UPDATED,
            message: "Category updated",
            metadata: { name },
        }
    },

    categoryArchived({
        workspaceId,
        actorId,
        categoryId,
    }: {
        workspaceId: string
        actorId: string
        categoryId: string
    }): EventInput {
        return {
            workspaceId,
            entityType: DomainEntityType.ASSET_CATEGORY,
            entityId: categoryId,
            actorId,
            type: DomainEventType.CATEGORY_ARCHIVED,
            message: "Category archived",
        }
    },

    workOrderCreated({
        workspaceId,
        actorId,
        workOrderId,
    }: {
        workspaceId: string
        actorId: string
        workOrderId: string
    }): EventInput {
        return {
            workspaceId,
            entityType: DomainEntityType.WORK_ORDER,
            entityId: workOrderId,
            actorId,
            type: DomainEventType.WORK_ORDER_CREATED,
            message: "Work order created",
        }
    },

    workOrderAction({
        workspaceId,
        actorId,
        workOrderId,
        action,
        previousStatus,
        newStatus,
        assigneeId,
    }: {
        workspaceId: string
        actorId: string
        workOrderId: string
        action: WorkOrderAction
        previousStatus: WorkOrderStatus
        newStatus: WorkOrderStatus
        assigneeId?: string
    }): EventInput {
        const eventByAction: Record<WorkOrderAction, DomainEventType> = {
            assign: DomainEventType.WORK_ORDER_ASSIGNED,
            start: DomainEventType.WORK_ORDER_STARTED,
            complete: DomainEventType.WORK_ORDER_COMPLETED,
            close: DomainEventType.WORK_ORDER_CLOSED,
        }

        const messageByAction: Record<WorkOrderAction, string> = {
            assign: "Work order assigned",
            start: "Work started",
            complete: "Work completed",
            close: "Work order closed",
        }

        return {
            workspaceId,
            entityType: DomainEntityType.WORK_ORDER,
            entityId: workOrderId,
            actorId,
            type: eventByAction[action],
            message: messageByAction[action],
            metadata: {
                action,
                previousStatus,
                newStatus,
                ...(assigneeId && { assigneeId }),
            },
        }
    },

    workOrderArchived({
        workspaceId,
        actorId,
        workOrderId,
    }: {
        workspaceId: string
        actorId: string
        workOrderId: string
    }): EventInput {
        return {
            workspaceId,
            entityType: DomainEntityType.WORK_ORDER,
            entityId: workOrderId,
            actorId,
            type: DomainEventType.WORK_ORDER_ARCHIVED,
            message: "Work order archived",
        }
    },

    commentAdded({
        workspaceId,
        actorId,
        workOrderId,
        message,
    }: {
        workspaceId: string
        actorId: string
        workOrderId: string
        message: string
    }): EventInput {
        return {
            workspaceId,
            entityType: DomainEntityType.WORK_ORDER,
            entityId: workOrderId,
            actorId,
            type: DomainEventType.COMMENT_ADDED,
            message,
        }
    },

    invitationSent({
        workspaceId,
        actorId,
        invitationId,
        email,
        role,
    }: {
        workspaceId: string
        actorId: string
        invitationId: string
        email: string
        role: Role
    }): EventInput {
        return {
            workspaceId,
            entityType: DomainEntityType.WORKSPACE_INVITATION,
            entityId: invitationId,
            actorId,
            type: DomainEventType.INVITATION_SENT,
            metadata: { email, role },
        }
    },

    invitationAccepted({
        workspaceId,
        actorId,
        invitationId,
    }: {
        workspaceId: string
        actorId: string
        invitationId: string
    }): EventInput {
        return {
            workspaceId,
            entityType: DomainEntityType.WORKSPACE_INVITATION,
            entityId: invitationId,
            actorId,
            type: DomainEventType.INVITATION_ACCEPTED,
        }
    },
}
