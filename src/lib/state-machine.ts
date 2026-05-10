/**
 * Generic state machine engine.
 *
 * Encodes the entire transition table for any status-bearing entity.
 * Adding a new machine (e.g. AssetLifecycle) is a one-liner call to
 * createStateMachine — no copy-pasting of the executeTransition logic.
 *
 * Usage:
 *   const machine = createStateMachine<AssetStatus, AssetAction, Role>({
 *     transitions: {
 *       retire: { from: ["ACTIVE"], to: "RETIRED", allowedRoles: ["OWNER"] },
 *     },
 *   })
 *   const next = machine.execute("retire", currentStatus, role)
 */

import { ForbiddenError } from "@/lib/errors"

export type TransitionRule<TStatus extends string, TRole extends string> = {
    from: readonly TStatus[]
    to: TStatus
    allowedRoles: readonly TRole[]
}

export type TransitionMap<
    TAction extends string,
    TStatus extends string,
    TRole extends string,
> = Record<TAction, TransitionRule<TStatus, TRole>>

export type StateMachine<
    TAction extends string,
    TStatus extends string,
    TRole extends string,
> = {
    /** Execute a transition and return the next status, or throw ForbiddenError. */
    execute(action: TAction, currentStatus: TStatus, role: TRole): TStatus

    /** Returns all actions that are valid from the given status for the given role. */
    availableActions(currentStatus: TStatus, role: TRole): TAction[]

    /** Returns the target status for an action without performing checks. */
    targetStatus(action: TAction): TStatus

    /** The raw transition table, for introspection or serialisation. */
    readonly transitions: TransitionMap<TAction, TStatus, TRole>
}

export function createStateMachine<
    TAction extends string,
    TStatus extends string,
    TRole extends string,
>(config: {
    transitions: TransitionMap<TAction, TStatus, TRole>
}): StateMachine<TAction, TStatus, TRole> {
    const { transitions } = config

    return {
        transitions,

        execute(action, currentStatus, role) {
            const rule = transitions[action]

            if (!rule.from.includes(currentStatus)) {
                throw new ForbiddenError(
                    `Action "${action}" is not allowed from status "${currentStatus}"`
                )
            }

            if (!rule.allowedRoles.includes(role)) {
                throw new ForbiddenError(
                    `Role "${role}" cannot perform action "${action}"`
                )
            }

            return rule.to
        },

        availableActions(currentStatus, role) {
            return (Object.keys(transitions) as TAction[]).filter((action) => {
                const rule = transitions[action]
                return rule.from.includes(currentStatus) && rule.allowedRoles.includes(role)
            })
        },

        targetStatus(action) {
            return transitions[action].to
        },
    }
}
