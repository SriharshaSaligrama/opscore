"use client"

import { ReactNode, useState } from "react"

import { editCategoryAction } from "@/features/asset-category/actions/edit-category.action"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"
import { ActionDialogForm } from "@/components/forms/action-dialog-form"

import { ActionState } from "@/lib/action-handler"

import { useActionDialog } from "@/hooks/use-action-dialog"
import { Category } from "@/features/asset/asset-types"

const initialState: ActionState = {
    success: false,
    error: "",
}

export default function EditCategoryDialog({
    category,
    children,
    onOptimisticUpdate,
}: {
    category: { id: string; name: string }
    children: ReactNode
    onOptimisticUpdate: (updates: Partial<Category>) => void
}) {
    const [open, setOpen] = useState(false)

    const { state, pending, formRef, handleAction } = useActionDialog(
        editCategoryAction,
        initialState,
        {
            onSuccess: (formData) => {
                onOptimisticUpdate({ name: formData.get("name") as string })
                setOpen(false)
            },
            refreshOnSuccess: true,
        }
    )

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

                <ActionDialogForm
                    formRef={formRef}
                    action={handleAction}
                    state={state}
                    pending={pending}
                    label="Save"
                    pendingLabel="Saving..."
                    hiddenFields={{ id: category.id }}
                >
                    <Input name="name" defaultValue={category.name} />
                </ActionDialogForm>
            </DialogContent>
        </Dialog>
    )
}
