"use client"

import { ReactNode, useState } from "react"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ActionState } from "@/lib/action-handler"
import { useActionDialog } from "@/hooks/use-action-dialog"
import { ActionError } from "@/components/forms/action-error"
import { ActionSubmitButton } from "@/components/forms/action-submit-button"

type ServerAction<TData = undefined> = (
    prevState: ActionState,
    formData: FormData
) => Promise<ActionState<TData>>

const initialState: ActionState = {
    success: false,
    error: "",
}

export function ConfirmActionDialog<TData = undefined>({
    children,
    title,
    description,
    action,
    hiddenFields,
    confirmLabel,
    pendingLabel,
    onSuccess,
}: {
    children: ReactNode
    title: ReactNode
    description: ReactNode
    action: ServerAction<TData>
    hiddenFields: Record<string, string>
    confirmLabel: string
    pendingLabel: string
    onSuccess?: () => void
}) {
    const [open, setOpen] = useState(false)

    const { state, pending, formRef, handleAction } = useActionDialog<TData>(
        action,
        initialState,
        {
            onSuccess: () => {
                onSuccess?.()
                setOpen(false)
            },
        }
    )

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>

                <form ref={formRef} action={handleAction}>
                    {Object.entries(hiddenFields).map(([name, value]) => (
                        <input key={name} type="hidden" name={name} value={value} />
                    ))}

                    <ActionError state={state} />

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <ActionSubmitButton
                            pending={pending}
                            label={confirmLabel}
                            pendingLabel={pendingLabel}
                            variant="destructive"
                        />
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}
