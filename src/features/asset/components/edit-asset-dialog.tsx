"use client"

import { ReactNode, useState, useTransition } from "react"
import { editAssetAction } from "@/features/asset/actions/edit-asset.action"
import { Asset, Category } from "@/features/asset/types/asset-types"
import { AssetStatus } from "@prisma/client"
import { toast } from "sonner"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select"

import { Loader2 } from "lucide-react"

export default function EditAssetDialog({
    asset,
    categories,
    children,
}: {
    asset: Asset
    categories: Category[]
    children: ReactNode
}) {
    const [open, setOpen] = useState(false)

    const [form, setForm] = useState(() => ({
        name: asset.name,
        categoryId: asset.categoryId ?? "",
        status: asset.status,
    }))

    const [isPending, startTransition] = useTransition()

    function handleOpenChange(next: boolean) {
        if (next) {
            // ✅ Always sync fresh data
            setForm({
                name: asset.name,
                categoryId: asset.categoryId ?? "",
                status: asset.status,
            })
        }
        setOpen(next)
    }

    function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault()

        if (!form.categoryId) {
            toast.error("Category is required")
            return
        }

        const formData = new FormData()
        formData.set("id", asset.id)
        formData.set("name", form.name.trim())
        formData.set("categoryId", form.categoryId)
        formData.set("status", form.status)

        startTransition(async () => {
            const res = await editAssetAction(null, formData)

            if (!res.success) {
                toast.error(res.error ?? "Failed to update asset")
                return
            }
        })
    }

    return (
        <>
            <div onClick={() => setOpen(true)}>
                {children}
            </div>

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="space-y-5 sm:max-w-md">

                    <DialogHeader>
                        <DialogTitle>Edit Asset</DialogTitle>
                        <DialogDescription>
                            Update the details of your asset.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Name */}
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                className="w-full"
                                value={form.name}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, name: e.target.value }))
                                }
                                disabled={isPending}
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label>Category</Label>

                            <Select
                                value={form.categoryId}
                                onValueChange={(v) =>
                                    setForm((prev) => ({ ...prev, categoryId: v }))
                                }
                                disabled={isPending}
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

                        {/* Status */}
                        <div className="space-y-2">
                            <Label>Status</Label>

                            <Select
                                value={form.status}
                                onValueChange={(v) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        status: v as AssetStatus,
                                    }))
                                }
                                disabled={isPending}
                            >
                                <SelectTrigger className="w-full flex justify-between items-center">
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

                        <Button type="submit" disabled={isPending} className="w-full">
                            {isPending && (
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                            )}
                            {isPending ? "Updating..." : "Update Asset"}
                        </Button>

                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

function formatStatusLabel(status: AssetStatus) {
    switch (status) {
        case "ACTIVE": return "Active"
        case "INACTIVE": return "Inactive"
        case "MAINTENANCE": return "Maintenance"
        case "RETIRED": return "Retired"
        default: return status
    }
}