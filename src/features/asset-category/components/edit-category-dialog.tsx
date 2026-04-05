"use client"

import { ReactNode, useActionState, useEffect, useRef, useState } from "react"

import { editCategoryAction } from "@/features/asset-category/actions/edit-category.action"

import { ActionState } from "@/types/action-state"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const initialState: ActionState = {
    success: false,
    error: null,
}

export default function EditCategoryDialog({
    category,
    children,
}: {
    category: { id: string; name: string }
    children: ReactNode
}) {
    const [open, setOpen] = useState(false)

    const [state, formAction, pending] = useActionState(
        editCategoryAction,
        initialState
    )

    const formRef = useRef<HTMLFormElement>(null)
    const wasPendingRef = useRef(false)

    useEffect(() => {
        if (wasPendingRef.current && !pending) {
            wasPendingRef.current = false

            const timer = setTimeout(() => {
                if (state.success) {
                    setOpen(false)
                    formRef.current?.reset()
                }
            }, 0)

            return () => clearTimeout(timer)
        }

        wasPendingRef.current = pending
    }, [pending, state.success])

    function handleAction(formData: FormData) {
        wasPendingRef.current = true
        formAction(formData)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Category</DialogTitle>

                    <DialogDescription>
                        Update the name of your category.
                    </DialogDescription>
                </DialogHeader>

                <form ref={formRef} action={handleAction} className="space-y-4">
                    <input type="hidden" name="id" value={category.id} />

                    <Input name="name" defaultValue={category.name} />

                    {state.error && (
                        <p className="text-sm text-red-500">{state.error}</p>
                    )}

                    <Button type="submit" disabled={pending} className="w-full">
                        {pending && (
                            <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        )}
                        {pending ? "Saving..." : "Save"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}