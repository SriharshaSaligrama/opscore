"use client"

import { ReactNode } from "react"
import { deleteCategoryAction } from "@/features/asset-category/actions/delete-category.action"
import { ConfirmActionDialog } from "@/components/forms/confirm-action-dialog"

export default function DeleteCategoryDialog({
    category,
    children,
    onDelete,
}: {
    category: { id: string; name: string }
    children: ReactNode
    onDelete?: (categoryId: string) => void
}) {
    return (
        <ConfirmActionDialog
            action={deleteCategoryAction}
            hiddenFields={{ id: category.id }}
            title={<>Archive &ldquo;{category.name}&rdquo;?</>}
            description={
                <>
                    This will archive the category and remove it from active lists.
                    Categories with active assets cannot be archived.
                </>
            }
            confirmLabel="Archive"
            pendingLabel="Archiving..."
            onSuccess={() => onDelete?.(category.id)}
        >
            {children}
        </ConfirmActionDialog>
    )
}
