import { ActionState } from "@/lib/action-handler"

export function ActionError({ state }: { state: ActionState<unknown> }) {
    if (state.success || !state.error) return null

    return <p className="text-sm text-red-500">{state.error}</p>
}
