"use client"

import { ReactNode, useActionState } from "react"
import {
    deleteAssetAction,
} from "@/features/asset/actions/delete-asset.action"
import { AssetActionState } from "@/features/asset/types/asset-types"

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

const initialState: AssetActionState = {
    success: false,
    error: null,
}

export default function DeleteAssetDialog({
    asset,
    children,
}: {
    asset: { id: string; name: string }
    children: ReactNode
}) {
    const [state, formAction, pending] = useActionState(
        deleteAssetAction,
        initialState
    )

    return (
        <AlertDialog>
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

                <form action={formAction}>
                    <input type="hidden" name="id" value={asset.id} />

                    {state.error && (
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