"use client"

import { useTransition } from "react"
import { AssetStatus } from "@prisma/client"
import { updateAssetStatusAction } from "@/features/asset/actions/update-asset-status.action"
import { toast } from "sonner"

import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select"

export default function AssetStatusSelect({
    assetId,
    currentStatus,
    isUpdating,
    onStart,
    onEnd,
    onOptimisticUpdate,
}: {
    assetId: string
    currentStatus: AssetStatus
    isUpdating: boolean
    onStart: () => void
    onEnd: () => void
    onOptimisticUpdate: (status: AssetStatus) => void
}) {
    const [pending, startTransition] = useTransition()

    function handleChange(nextStatus: AssetStatus) {
        const formData = new FormData()
        formData.set("id", assetId)
        formData.set("status", nextStatus)

        onOptimisticUpdate(nextStatus)
        onStart()

        startTransition(async () => {
            const res = await updateAssetStatusAction(null, formData)

            if (!res.success) {
                toast.error(res.error ?? "Failed to update status")
            }

            onEnd()
        })
    }

    return (
        <Select
            value={currentStatus}
            onValueChange={(v) => handleChange(v as AssetStatus)}
        >
            <SelectTrigger className="w-35 flex items-center justify-between" disabled={pending || isUpdating}>
                <div className="flex items-center gap-2">
                    {(pending || isUpdating) && (
                        <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    )}
                    <SelectValue />
                </div>
            </SelectTrigger>

            <SelectContent>
                {Object.values(AssetStatus).map((s) => (
                    <SelectItem key={s} value={s}>
                        {formatStatusLabel(s)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
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