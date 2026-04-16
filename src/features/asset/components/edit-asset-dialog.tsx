"use client"

import { ReactNode, useState } from "react"

import { editAssetAction } from "@/features/asset/actions/edit-asset.action"
import { Asset, Category } from "@/features/asset/asset-types"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select"

import { ActionState } from "@/lib/action-handler"
import { useActionDialog } from "@/hooks/use-action-dialog"

import { AssetStatus } from "@prisma/client"

const initialState: ActionState = {
    success: false,
    error: "",
}

export default function EditAssetDialog({
    asset,
    categories,
    children,
    isUpdating = false,
    onOptimisticUpdate,
}: {
    asset: Asset
    categories: Category[]
    children: ReactNode
    isUpdating: boolean
    onOptimisticUpdate: (updates: Partial<Asset>) => void
}) {
    const [open, setOpen] = useState(false)

    const { state, pending, formRef, handleAction } = useActionDialog(
        editAssetAction,
        initialState,
        {
            onSuccess: (formData) => {
                const categoryId = formData.get("categoryId") as string
                const updatedCategory = categories.find((c) => c.id === categoryId)

                onOptimisticUpdate({
                    name: (formData.get("name") as string)?.trim(),
                    categoryId,
                    category: updatedCategory ?? asset.category,
                    status: formData.get("status") as AssetStatus,
                })

                setOpen(false)
            },
            refreshOnSuccess: true,
        }
    )

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent className="space-y-5 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Asset</DialogTitle>
                    <DialogDescription>
                        Update the details of your asset.
                    </DialogDescription>
                </DialogHeader>

                <form ref={formRef} action={handleAction} className="space-y-5">
                    <input type="hidden" name="id" value={asset.id} />

                    {/* NAME */}
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                            name="name"
                            defaultValue={asset.name}
                        />
                    </div>

                    {/* CATEGORY */}
                    <div className="space-y-2">
                        <Label>Category</Label>

                        <Select
                            name="categoryId"
                            defaultValue={asset.categoryId ?? ""}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>

                            <SelectContent>
                                {categories.length === 0 ? (
                                    <div className="p-2 text-sm text-muted-foreground">
                                        No categories found
                                    </div>
                                ) : (
                                    categories.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* STATUS */}
                    <div className="space-y-2">
                        <Label>Status</Label>

                        <Select
                            name="status"
                            defaultValue={asset.status}
                            disabled={isUpdating}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                                {Object.values(AssetStatus).map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {formatStatusLabel(s)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* GLOBAL ERROR */}
                    {!state.success && state.error && (
                        <p className="text-sm text-red-500">
                            {state.error}
                        </p>
                    )}

                    {isUpdating && (
                        <p className="text-xs text-muted-foreground">
                            Status is being updated. Please wait...
                        </p>
                    )}

                    {/* SUBMIT */}
                    <Button type="submit" disabled={pending || isUpdating} className="w-full">
                        {pending && (
                            <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        )}
                        {pending ? "Updating..." : "Update Asset"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

/* ------------------ */
/* Helpers */
/* ------------------ */

function formatStatusLabel(status: AssetStatus) {
    switch (status) {
        case "ACTIVE":
            return "Active"
        case "INACTIVE":
            return "Inactive"
        case "MAINTENANCE":
            return "Maintenance"
        case "RETIRED":
            return "Retired"
        default:
            return status
    }
}