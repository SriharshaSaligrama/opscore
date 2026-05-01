"use client"

import { ReactNode } from "react"

import { deleteAssetAction } from "@/features/asset/actions/delete-asset.action"
import { ConfirmActionDialog } from "@/components/forms/confirm-action-dialog"

export default function DeleteAssetDialog({
    asset,
    children,
    onDelete,
}: {
    asset: { id: string; name: string }
    children: ReactNode
    onDelete?: (assetId: string) => void
}) {
    return (
        <ConfirmActionDialog
            action={deleteAssetAction}
            hiddenFields={{ id: asset.id }}
            title={<>Delete &ldquo;{asset.name}&rdquo;?</>}
            description={
                <>
                    This will archive the asset. It will no longer appear in active
                    lists. If any work order still references this asset, archiving is
                    blocked.
                </>
            }
            confirmLabel="Delete"
            pendingLabel="Deleting..."
            onSuccess={() => onDelete?.(asset.id)}
        >
            {children}
        </ConfirmActionDialog>
    )
}
