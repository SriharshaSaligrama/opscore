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

                <form ref={formRef} action={handleAction} className="space-y-4">
                    <Input name="name" placeholder="Workspace name" autoFocus />

                    {!state.success && state.error && (
                        <p className="text-sm text-red-500">{state.error}</p>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={pending}>
                            {pending ? "Creating..." : "Create Workspace"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}