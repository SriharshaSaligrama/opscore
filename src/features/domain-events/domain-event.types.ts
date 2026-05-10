/**
 * Domain event type registry with discriminated union metadata shapes.
 *
 * Every event type has a strongly-typed metadata contract. The compiler
 * will catch any builder that passes the wrong fields.
 *
 * Adding a new event:
 *  1. Add the event key to DomainEventType.
 *  2. Add its metadata type to DomainEventMetadataMap.
 *  3. Add a builder function in domain-event.builders.ts.
 */

import { AssetStatus, Role, WorkOrderStatus } from "@prisma/client"
import type { WorkOrderAction } from "@/features/work-order/work-order.state-machine"

// ---------------------------------------------------------------------------
// Event type enum
// ---------------------------------------------------------------------------

export enum DomainEventType {
    // Workspace
    WORKSPACE_CREATED = "WORKSPACE_CREATED",
    WORKSPACE_RENAMED = "WORKSPACE_RENAMED",
    WORKSPACE_ARCHIVED = "WORKSPACE_ARCHIVED",
    // Assets
    ASSET_CREATED = "ASSET_CREATED",
    ASSET_UPDATED = "ASSET_UPDATED",
    ASSET_ARCHIVED = "ASSET_ARCHIVED",
    // Categories
    CATEGORY_CREATED = "CATEGORY_CREATED",
    CATEGORY_UPDATED = "CATEGORY_UPDATED",
    CATEGORY_ARCHIVED = "CATEGORY_ARCHIVED",
    // Work orders
    WORK_ORDER_CREATED = "WORK_ORDER_CREATED",
    WORK_ORDER_ASSIGNED = "WORK_ORDER_ASSIGNED",
    WORK_ORDER_STARTED = "WORK_ORDER_STARTED",
    WORK_ORDER_COMPLETED = "WORK_ORDER_COMPLETED",
    WORK_ORDER_CLOSED = "WORK_ORDER_CLOSED",
    WORK_ORDER_ARCHIVED = "WORK_ORDER_ARCHIVED",
    COMMENT_ADDED = "COMMENT_ADDED",
    // Membership
    MEMBER_ADDED = "MEMBER_ADDED",
    MEMBER_REMOVED = "MEMBER_REMOVED",
    MEMBER_ROLE_CHANGED = "MEMBER_ROLE_CHANGED",
    // Invitations
    INVITATION_SENT = "INVITATION_SENT",
    INVITATION_ACCEPTED = "INVITATION_ACCEPTED",
}

// ---------------------------------------------------------------------------
// Per-event metadata shapes (discriminated union)
// ---------------------------------------------------------------------------

export type DomainEventMetadataMap = {
    [DomainEventType.WORKSPACE_CREATED]:  { name: string; source?: string }
    [DomainEventType.WORKSPACE_RENAMED]:  { oldName: string; newName: string }
    [DomainEventType.WORKSPACE_ARCHIVED]: Record<string, never>
    [DomainEventType.ASSET_CREATED]:      { name: string; categoryId: string }
    [DomainEventType.ASSET_UPDATED]:      { name?: string; categoryId?: string; status?: AssetStatus }
    [DomainEventType.ASSET_ARCHIVED]:     Record<string, never>
    [DomainEventType.CATEGORY_CREATED]:   { name: string }
    [DomainEventType.CATEGORY_UPDATED]:   { name: string }
    [DomainEventType.CATEGORY_ARCHIVED]:  Record<string, never>
    [DomainEventType.WORK_ORDER_CREATED]: Record<string, never>
    [DomainEventType.WORK_ORDER_ASSIGNED]:  { action: WorkOrderAction; previousStatus: WorkOrderStatus; newStatus: WorkOrderStatus; assigneeId?: string }
    [DomainEventType.WORK_ORDER_STARTED]:   { action: WorkOrderAction; previousStatus: WorkOrderStatus; newStatus: WorkOrderStatus }
    [DomainEventType.WORK_ORDER_COMPLETED]: { action: WorkOrderAction; previousStatus: WorkOrderStatus; newStatus: WorkOrderStatus }
    [DomainEventType.WORK_ORDER_CLOSED]:    { action: WorkOrderAction; previousStatus: WorkOrderStatus; newStatus: WorkOrderStatus }
    [DomainEventType.WORK_ORDER_ARCHIVED]:  Record<string, never>
    [DomainEventType.COMMENT_ADDED]:        { message: string }
    [DomainEventType.MEMBER_ADDED]:         { role: Role; source?: string }
    [DomainEventType.MEMBER_REMOVED]:       Record<string, never>
    [DomainEventType.MEMBER_ROLE_CHANGED]:  { newRole: Role }
    [DomainEventType.INVITATION_SENT]:      { email: string; role: Role }
    [DomainEventType.INVITATION_ACCEPTED]:  Record<string, never>
}

/** Helper: extract the metadata type for a given event type. */
export type MetadataFor<T extends DomainEventType> = DomainEventMetadataMap[T]
