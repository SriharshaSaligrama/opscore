"use client"

import { type ComponentProps, type ReactNode, type RefObject } from "react"
import { ActionState } from "@/lib/action-handler"
import { ActionError } from "@/components/forms/action-error"
import { ActionSubmitButton } from "@/components/forms/action-submit-button"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ActionDialogForm({
    formRef,
    action,
    state,
    pending,
    label,
    pendingLabel,
    disabled,
    className,
    submitClassName,
    variant,
    hiddenFields,
    footer,
    children,
}: {
    formRef: RefObject<HTMLFormElement | null>
    action: (formData: FormData) => void
    state: ActionState<unknown>
    pending: boolean
    label: string
    pendingLabel: string
    disabled?: boolean
    className?: string
    submitClassName?: string
    variant?: ComponentProps<typeof Button>["variant"]
    hiddenFields?: Record<string, string>
    footer?: ReactNode
    children: ReactNode
}) {
    return (
        <form ref={formRef} action={action} className={cn("space-y-4", className)}>
            {hiddenFields &&
                Object.entries(hiddenFields).map(([name, value]) => (
                    <input key={name} type="hidden" name={name} value={value} />
                ))}
            {children}
            <ActionError state={state} />
            {footer ?? (
                <ActionSubmitButton
                    pending={pending}
                    label={label}
                    pendingLabel={pendingLabel}
                    disabled={disabled}
                    variant={variant}
                    className={cn("w-full", submitClassName)}
                />
            )}
        </form>
    )
}
