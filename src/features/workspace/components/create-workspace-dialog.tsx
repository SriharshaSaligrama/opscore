"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ActionSubmitButton } from "@/components/forms/action-submit-button"
import { ActionDialogForm } from "@/components/forms/action-dialog-form"

import { ActionState } from "@/lib/action-handler"
import { useActionDialog } from "@/hooks/use-action-dialog"
import { createWorkspaceAction } from "@/features/workspace/actions/create-workspace.action"

const initialState: ActionState = {
    success: false,
    error: "",
}

export default function CreateWorkspaceDialog({
    open,
    onOpenChange,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const { state, pending, formRef, handleAction } = useActionDialog<{
        id: string
        name: string
    }>(
        createWorkspaceAction,
        initialState,
        {
            onSuccess: () => {
                onOpenChange(false)
            },
        }
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Workspace</DialogTitle>

                    <DialogDescription>
                        Create a new workspace to organize your team and assets.
                    </DialogDescription>
                </DialogHeader>

                <ActionDialogForm
                    formRef={formRef}
                    action={handleAction}
                    state={state}
                    pending={pending}
                    label="Create Workspace"
                    pendingLabel="Creating..."
                    footer={
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <ActionSubmitButton
                                pending={pending}
                                label="Create Workspace"
                                pendingLabel="Creating..."
                            />
                        </div>
                    }
                >
                    <Input name="name" placeholder="Workspace name" autoFocus />
                </ActionDialogForm>
            </DialogContent>
        </Dialog>
    )
}
