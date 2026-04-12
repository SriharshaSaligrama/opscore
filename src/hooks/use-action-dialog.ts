"use client"

import { useActionState, useEffect, useRef } from "react"
import { ActionState } from "@/lib/action-handler"

type ServerAction = (
    state: ActionState,
    formData: FormData
) => Promise<ActionState>

export function useActionDialog(
    action: ServerAction,
    initialState: ActionState,
    onSuccess?: () => void
) {
    const [state, formAction, pending] = useActionState(action, initialState)

    const formRef = useRef<HTMLFormElement>(null)
    const wasPendingRef = useRef(false)

    useEffect(() => {
        if (wasPendingRef.current && !pending) {
            wasPendingRef.current = false

            const timer = setTimeout(() => {
                if (state.success) {
                    onSuccess?.()
                    formRef.current?.reset()
                }
            }, 0)

            return () => clearTimeout(timer)
        }

        wasPendingRef.current = pending
    }, [pending, state.success, onSuccess])

    function handleAction(formData: FormData) {
        wasPendingRef.current = true
        formAction(formData)
    }

    return {
        state,
        pending,
        formRef,
        handleAction,
    }
}