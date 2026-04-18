"use client"

import { ReactNode, useState } from "react"
import { deleteCategoryAction } from "@/features/asset-category/actions/delete-category.action"

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogDescription,
} from "@/components/ui/alert-dialog"

import { Button } from "@/components/ui/button"

import { ActionState } from "@/lib/action-handler"
import { useActionDialog } from "@/hooks/use-action-dialog"

const initialState: ActionState = {
    success: false,
    error: "",
}

export default function DeleteCategoryDialog({
    category,
    children,
    onDelete,
}: {
    category: { id: string; name: string }
    children: ReactNode
    onDelete?: (categoryId: string) => void
}) {
    const [open, setOpen] = useState(false)

    const { state, pending, formRef, handleAction } = useActionDialog<string>(
        deleteCategoryAction,
        initialState,
        {
            onSuccess: () => {
                onDelete?.(category.id)
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
                        Archive &ldquo;{category.name}&rdquo;?
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        This will archive the category and remove it from active lists.
                        Categories with active assets cannot be archived.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <form ref={formRef} action={handleAction}>
                    <input type="hidden" name="id" value={category.id} />

                    {!state.success && state.error && (
                        <p className="text-sm text-red-500">{state.error}</p>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>

                        <Button type="submit" variant="destructive" disabled={pending}>
                            {pending && (
                                <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                            )}
                            {pending ? "Archiving..." : "Archive"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}
