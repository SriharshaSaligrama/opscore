"use client"

import { ReactNode, useState } from "react"

import { deleteAssetAction } from "@/features/asset/actions/delete-asset.action"
import { useActionDialog } from "@/hooks/use-action-dialog"

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogTrigger,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog"

import { Button } from "@/components/ui/button"

import { ActionState } from "@/lib/action-handler"

const initialState: ActionState = {
    success: false,
    error: "",
}

export default function DeleteAssetDialog({
    asset,
    children,
    onDelete,
}: {
    asset: { id: string; name: string }
    children: ReactNode
    onDelete?: (assetId: string) => void
}) {
    const [open, setOpen] = useState(false)

    const { state, pending, formRef, handleAction } = useActionDialog<string>(
        deleteAssetAction,
        initialState,
        {
            onSuccess: () => {
                onDelete?.(asset.id)
                setOpen(false)
            },
        }
    )

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Delete &ldquo;{asset.name}&rdquo;?
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        This asset will be permanently deleted. If it has work orders,
                        deletion will be blocked.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <form ref={formRef} action={handleAction}>
                    <input type="hidden" name="id" value={asset.id} />

                    {!state.success && state.error && (
                        <p className="text-sm text-red-500">{state.error}</p>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>

                        <Button type="submit" variant="destructive" disabled={pending}>
                            {pending && (
                                <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                            )}
                            {pending ? "Deleting..." : "Delete"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}