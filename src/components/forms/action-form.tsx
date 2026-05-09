"use client"

import { type ReactNode } from "react"
import { ActionState } from "@/lib/action-handler"
import { ActionError } from "@/components/forms/action-error"
import { ActionSubmitButton } from "@/components/forms/action-submit-button"
import { cn } from "@/lib/utils"

export function ActionForm({
    action,
    state,
    pending,
    label,
    pendingLabel,
    className,
    submitClassName,
    disabled,
    children,
}: {
    action: (formData: FormData) => void
    state: ActionState<unknown>
    pending: boolean
    label: string
    pendingLabel: string
    className?: string
    submitClassName?: string
    disabled?: boolean
    children: ReactNode
}) {
    return (
        <form action={action} className={cn("space-y-4", className)}>
            {children}
            <ActionError state={state} />
            <ActionSubmitButton
                pending={pending}
                label={label}
                pendingLabel={pendingLabel}
                disabled={disabled}
                className={cn("w-full", submitClassName)}
            />
        </form>
    )
}
