"use client"

import { useActionState, useEffect, useRef } from "react"
import { createCategoryAction } from "@/features/asset-category/actions/create-category.action"
import { CategoryActionState } from "@/features/asset-category/types/asset-category-types"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const initialState: CategoryActionState = {
    success: false,
    error: null,
}

export default function CreateCategoryDialog({
    open,
    onOpenChange,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const [state, formAction, pending] = useActionState(createCategoryAction, initialState)
    const formRef = useRef<HTMLFormElement>(null)
    const wasPendingRef = useRef(false)

    useEffect(() => {
        if (wasPendingRef.current && !pending) {
            wasPendingRef.current = false

            const timer = window.setTimeout(() => {
                if (state.success && open) {
                    onOpenChange(false)
                    formRef.current?.reset()
                }
            }, 0)

            return () => window.clearTimeout(timer)
        }

        wasPendingRef.current = pending
    }, [onOpenChange, open, pending, state.success])

    async function handleFormAction(formData: FormData) {
        wasPendingRef.current = true
        formAction(formData)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Category</DialogTitle>

                    <DialogDescription>
                        Create a new category to organize your assets.
                    </DialogDescription>
                </DialogHeader>

                <form ref={formRef} action={handleFormAction} className="space-y-4">
                    <Input name="name" placeholder="Category name" />

                    {state.error && (
                        <p className="text-sm text-red-500">{state.error}</p>
                    )}

                    <Button type="submit" disabled={pending} className="w-full">
                        {pending && (
                            <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        )}
                        {pending ? "Creating..." : "Create Category"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
