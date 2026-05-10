/**
 * Work-order state machine.
 *
 * Adding a new action only requires:
 *  1. Add the action string to WorkOrderAction
 *  2. Add one transition entry to the WorkOrderWorkflow map
 *
 * No changes to WorkOrderService or the generic engine needed.
 */

import { WorkOrderStatus, Role } from "@prisma/client"
import { createStateMachine } from "@/lib/state-machine"

export type WorkOrderAction = "assign" | "start" | "complete" | "close"

export const workOrderStateMachine = createStateMachine<
    WorkOrderAction,
    WorkOrderStatus,
    Role
>({
    transitions: {
        assign: {
            from: ["OPEN"],
            to: "ASSIGNED",
            allowedRoles: ["OWNER", "ADMIN", "MANAGER"],
        },
        start: {
            from: ["ASSIGNED"],
            to: "IN_PROGRESS",
            allowedRoles: ["OWNER", "ADMIN", "TECHNICIAN"],
        },
        complete: {
            from: ["IN_PROGRESS"],
            to: "COMPLETED",
            allowedRoles: ["OWNER", "ADMIN", "TECHNICIAN"],
        },
        close: {
            from: ["COMPLETED"],
            to: "CLOSED",
            allowedRoles: ["OWNER", "ADMIN"],
        },
    },
})

/**
 * Convenience re-export for backward-compatibility with existing callers.
 * Prefer calling workOrderStateMachine.execute() directly in new code.
 */
export function executeTransition(
    action: WorkOrderAction,
    currentStatus: WorkOrderStatus,
    role: Role
): WorkOrderStatus {
    return workOrderStateMachine.execute(action, currentStatus, role)
}

/** The raw workflow map (kept for introspection / tests). */
export const WorkOrderWorkflow = workOrderStateMachine.transitions
