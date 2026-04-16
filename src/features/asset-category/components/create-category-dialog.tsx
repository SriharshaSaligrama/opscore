"use client"

import { createCategoryAction } from "@/features/asset-category/actions/create-category.action"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { ActionState } from "@/lib/action-handler"
import { useActionDialog } from "@/hooks/use-action-dialog"

const initialState: ActionState = {
    success: false,
    error: '',
}

export default function CreateCategoryDialog({
    open,
    onOpenChange,
    onCreate,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreate?: (category: { id: string; name: string }) => void
}) {
    const { state, pending, formRef, handleAction } = useActionDialog<{
        id: string
        name: string
    }>(
        createCategoryAction,
        initialState,
        {
            onSuccess: (_formData, result) => {
                if (result.success && "data" in result) {
                    onCreate?.(result.data)
                }

                onOpenChange(false)
            },
        }
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Category</DialogTitle>

                    <DialogDescription>
                        Create a new category to organize your assets.
                    </DialogDescription>
                </DialogHeader>

                <form ref={formRef} action={handleAction} className="space-y-4">
                    <Input name="name" placeholder="Category name" />

                    {!state.success && state.error && (
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
