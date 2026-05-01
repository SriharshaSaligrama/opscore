"use client"

import { createCategoryAction } from "@/features/asset-category/actions/create-category.action"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"
import { ActionDialogForm } from "@/components/forms/action-dialog-form"

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

                <ActionDialogForm
                    formRef={formRef}
                    action={handleAction}
                    state={state}
                    pending={pending}
                    label="Create Category"
                    pendingLabel="Creating..."
                >
                    <Input name="name" placeholder="Category name" />
                </ActionDialogForm>
            </DialogContent>
        </Dialog>
    )
}
