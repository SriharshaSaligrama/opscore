import { WorkOrderStatus, Role } from "@prisma/client"
import { ForbiddenError } from "@/lib/errors"

/*
ACTION TYPE

Adding a new action later only requires:
1) add new action string here
2) add workflow rule below
*/

export type WorkOrderAction = "assign" | "start" | "complete" | "close"

type TransitionRule = {
    from: readonly WorkOrderStatus[]
    to: WorkOrderStatus
    roles: readonly Role[]
}

export const WorkOrderWorkflow: Record<
    WorkOrderAction,
    TransitionRule
> = {
    assign: {
        from: ["OPEN"],
        to: "ASSIGNED",
        roles: ["OWNER", "ADMIN", "MANAGER"],
    },

    start: {
        from: ["ASSIGNED"],
        to: "IN_PROGRESS",
        roles: ["OWNER", "ADMIN", "TECHNICIAN"],
    },

    complete: {
        from: ["IN_PROGRESS"],
        to: "COMPLETED",
        roles: ["OWNER", "ADMIN", "TECHNICIAN"],
    },

    close: {
        from: ["COMPLETED"],
        to: "CLOSED",
        roles: ["OWNER", "ADMIN"],
    },
}

/*
WORKFLOW ENGINE
*/

export function executeTransition(
    action: WorkOrderAction,
    currentStatus: WorkOrderStatus,
    role: Role
): WorkOrderStatus {

    const rule = WorkOrderWorkflow[action]

    if (!rule.from.includes(currentStatus)) {
        throw new ForbiddenError(
            `Action "${action}" not allowed from status "${currentStatus}"`
        )
    }

    if (!rule.roles.includes(role)) {
        throw new ForbiddenError(
            `Role "${role}" cannot perform "${action}"`
        )
    }

    return rule.to
}