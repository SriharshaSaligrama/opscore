"use client"

import { useActionState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ActionState } from "@/lib/action-handler"

type ServerAction<TData = undefined> = (
    prevState: ActionState,
    formData: FormData
) => Promise<ActionState<TData>>

export function useActionDialog<TData = undefined>(
    action: ServerAction<TData>,
    initialState: ActionState,
    options?: {
        onSuccess?: (formData: FormData, result: ActionState<TData>) => void
        onError?: (error: string) => void
        resetOnSuccess?: boolean
        refreshOnSuccess?: boolean
    }
) {
    const router = useRouter()
    const formRef = useRef<HTMLFormElement>(null)

    const [state, internalAction, pending] = useActionState(
        async (prevState: ActionState, formData: FormData) => {
            const result = await action(prevState, formData)

            // ✅ HANDLE SUCCESS IMMEDIATELY
            if (result.success) {
                options?.onSuccess?.(formData, result)

                if (options?.resetOnSuccess !== false) {
                    formRef.current?.reset()
                }

                if (options?.refreshOnSuccess) {
                    router.refresh()
                }
            }

            // ✅ HANDLE ERROR IMMEDIATELY
            if (!result.success && result.error) {
                options?.onError?.(result.error)
            }

            return result
        },
        initialState
    )

    function handleAction(formData: FormData) {
        internalAction(formData)
    }

    return {
        state,
        pending,
        formRef,
        handleAction,
    }
}