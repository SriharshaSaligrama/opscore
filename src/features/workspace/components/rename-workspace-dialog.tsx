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
import { renameWorkspaceAction } from "@/features/workspace/actions/rename-workspace.action"

const initialState: ActionState = {
    success: false,
    error: "",
}

export default function RenameWorkspaceDialog({
    currentName,
    open,
    onOpenChange,
    onRename,
}: {
    currentName: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onRename?: (newName: string) => void
}) {
    const { state, pending, formRef, handleAction } = useActionDialog(
        renameWorkspaceAction,
        initialState,
        {
            onSuccess: (formData) => {
                const newName = formData.get("name") as string

                onRename?.(newName)
                onOpenChange(false)
            },
        }
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename Workspace</DialogTitle>

                    <DialogDescription>
                        Change the name of your workspace.
                    </DialogDescription>
                </DialogHeader>

                <form ref={formRef} action={handleAction} className="space-y-4">
                    <Input
                        name="name"
                        placeholder="Workspace name"
                        defaultValue={currentName}
                    />

                    {!state.success && state.error && (
                        <p className="text-sm text-red-500">{state.error}</p>
                    )}

                    <Button type="submit" disabled={pending} className="w-full">
                        {pending ? "Saving..." : "Save"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}