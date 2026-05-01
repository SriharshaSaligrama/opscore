import { describe, expect, it } from "vitest"
import { AssetStatus, DomainEntityType, Role, WorkOrderStatus } from "@prisma/client"
import { domainEvents } from "@/features/domain-events/domain-event.builders"
import { DomainEventType } from "@/features/domain-events/domain-event.types"

describe("domainEvents", () => {
    it("builds signup workspace and member events with stable metadata", () => {
        expect(
            domainEvents.workspaceCreated({
                workspaceId: "workspace-1",
                actorId: "user-1",
                name: "Ops",
                source: "signup",
            })
        ).toMatchObject({
            workspaceId: "workspace-1",
            entityId: "workspace-1",
            actorId: "user-1",
            type: DomainEventType.WORKSPACE_CREATED,
            message: "Workspace created",
            metadata: {
                name: "Ops",
                source: "signup",
            },
        })

        expect(
            domainEvents.memberAdded({
                workspaceId: "workspace-1",
                actorId: "user-1",
                userId: "user-1",
                role: Role.OWNER,
                source: "signup",
            })
        ).toMatchObject({
            workspaceId: "workspace-1",
            entityId: "user-1",
            actorId: "user-1",
            type: DomainEventType.MEMBER_ADDED,
            message: "Workspace owner added",
            metadata: {
                role: Role.OWNER,
                source: "signup",
            },
        })
    })

    it("builds asset events with stable metadata", () => {
        expect(
            domainEvents.assetCreated({
                workspaceId: "workspace-1",
                actorId: "user-1",
                assetId: "asset-1",
                name: "Pump",
                categoryId: "category-1",
            })
        ).toMatchObject({
            workspaceId: "workspace-1",
            entityType: DomainEntityType.ASSET,
            entityId: "asset-1",
            actorId: "user-1",
            type: DomainEventType.ASSET_CREATED,
            message: "Asset created",
            metadata: {
                name: "Pump",
                categoryId: "category-1",
            },
        })

        expect(
            domainEvents.assetUpdated({
                workspaceId: "workspace-1",
                actorId: "user-1",
                assetId: "asset-1",
                metadata: {
                    name: "Pump 2",
                    categoryId: "category-2",
                    status: AssetStatus.MAINTENANCE,
                },
            })
        ).toMatchObject({
            type: DomainEventType.ASSET_UPDATED,
            message: "Asset updated",
            metadata: {
                name: "Pump 2",
                categoryId: "category-2",
                status: AssetStatus.MAINTENANCE,
            },
        })

        expect(
            domainEvents.assetArchived({
                workspaceId: "workspace-1",
                actorId: "user-1",
                assetId: "asset-1",
            })
        ).toMatchObject({
            entityType: DomainEntityType.ASSET,
            entityId: "asset-1",
            type: DomainEventType.ASSET_ARCHIVED,
            message: "Asset archived",
        })
    })

    it("builds category events with stable metadata", () => {
        expect(
            domainEvents.categoryCreated({
                workspaceId: "workspace-1",
                actorId: "user-1",
                categoryId: "category-1",
                name: "HVAC",
            })
        ).toMatchObject({
            entityType: DomainEntityType.ASSET_CATEGORY,
            entityId: "category-1",
            type: DomainEventType.CATEGORY_CREATED,
            message: "Category created",
            metadata: { name: "HVAC" },
        })

        expect(
            domainEvents.categoryUpdated({
                workspaceId: "workspace-1",
                actorId: "user-1",
                categoryId: "category-1",
                name: "Electrical",
            })
        ).toMatchObject({
            type: DomainEventType.CATEGORY_UPDATED,
            message: "Category updated",
            metadata: { name: "Electrical" },
        })

        expect(
            domainEvents.categoryArchived({
                workspaceId: "workspace-1",
                actorId: "user-1",
                categoryId: "category-1",
            })
        ).toMatchObject({
            type: DomainEventType.CATEGORY_ARCHIVED,
            message: "Category archived",
        })
    })

    it("builds work-order events with stable metadata", () => {
        expect(
            domainEvents.workOrderCreated({
                workspaceId: "workspace-1",
                actorId: "user-1",
                workOrderId: "work-order-1",
            })
        ).toMatchObject({
            entityType: DomainEntityType.WORK_ORDER,
            entityId: "work-order-1",
            type: DomainEventType.WORK_ORDER_CREATED,
            message: "Work order created",
        })

        expect(
            domainEvents.workOrderAction({
                workspaceId: "workspace-1",
                actorId: "user-1",
                workOrderId: "work-order-1",
                action: "assign",
                previousStatus: WorkOrderStatus.OPEN,
                newStatus: WorkOrderStatus.ASSIGNED,
                assigneeId: "user-2",
            })
        ).toMatchObject({
            type: DomainEventType.WORK_ORDER_ASSIGNED,
            message: "Work order assigned",
            metadata: {
                action: "assign",
                previousStatus: WorkOrderStatus.OPEN,
                newStatus: WorkOrderStatus.ASSIGNED,
                assigneeId: "user-2",
            },
        })

        expect(
            domainEvents.workOrderArchived({
                workspaceId: "workspace-1",
                actorId: "user-1",
                workOrderId: "work-order-1",
            })
        ).toMatchObject({
            type: DomainEventType.WORK_ORDER_ARCHIVED,
            message: "Work order archived",
        })

        expect(
            domainEvents.commentAdded({
                workspaceId: "workspace-1",
                actorId: "user-1",
                workOrderId: "work-order-1",
                message: "Checked belt tension",
            })
        ).toMatchObject({
            type: DomainEventType.COMMENT_ADDED,
            message: "Checked belt tension",
        })
    })

    it("builds membership and invitation events with stable metadata", () => {
        expect(
            domainEvents.memberRoleChanged({
                workspaceId: "workspace-1",
                actorId: "user-1",
                userId: "user-2",
                newRole: Role.MANAGER,
            })
        ).toMatchObject({
            entityType: DomainEntityType.MEMBERSHIP,
            entityId: "user-2",
            type: DomainEventType.MEMBER_ROLE_CHANGED,
            metadata: { newRole: Role.MANAGER },
        })

        expect(
            domainEvents.invitationSent({
                workspaceId: "workspace-1",
                actorId: "user-1",
                invitationId: "invite-1",
                email: "new@example.com",
                role: Role.TECHNICIAN,
            })
        ).toMatchObject({
            entityType: DomainEntityType.WORKSPACE_INVITATION,
            entityId: "invite-1",
            type: DomainEventType.INVITATION_SENT,
            metadata: {
                email: "new@example.com",
                role: Role.TECHNICIAN,
            },
        })

        expect(
            domainEvents.invitationAccepted({
                workspaceId: "workspace-1",
                actorId: "user-2",
                invitationId: "invite-1",
            })
        ).toMatchObject({
            entityType: DomainEntityType.WORKSPACE_INVITATION,
            entityId: "invite-1",
            type: DomainEventType.INVITATION_ACCEPTED,
        })
    })
})
