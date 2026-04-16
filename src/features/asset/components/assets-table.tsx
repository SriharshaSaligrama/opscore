"use client"

import { useState } from "react"

import { Asset, Category } from "@/features/asset/asset-types"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"

import { Pencil, Trash2 } from "lucide-react"

import EditAssetDialog from "./edit-asset-dialog"
import DeleteAssetDialog from "./delete-asset-dialog"
import AssetStatusBadge from "./assets-status-badge"
import AssetStatusSelect from "./assets-status-select"
import AssetsEmptyState from "./assets-empty-state"

export default function AssetsTable({
    assets,
    categories,
    onAssetUpdated,
    onAssetDeleted,
}: {
    assets: Asset[]
    categories: Category[]
    onAssetUpdated: (assetId: string, updates: Partial<Asset>) => void
    onAssetDeleted?: (assetId: string) => void
}) {
    const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())

    function markUpdating(id: string) {
        setUpdatingIds(prev => new Set(prev).add(id))
    }

    function unmarkUpdating(id: string) {
        setUpdatingIds(prev => {
            const next = new Set(prev)
            next.delete(id)
            return next
        })
    }

    const assetsToRender = assets
    const categoriesToRender = categories

    if (assets.length === 0) {
        return (
            <AssetsEmptyState />
        )
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right w-30">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {assetsToRender.map(asset => {
                        return (
                            <TableRow key={asset.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="font-medium truncate max-w-50">
                                    {asset.name}
                                </TableCell>

                                <TableCell>
                                    <AssetStatusBadge status={asset.status} />
                                </TableCell>

                                <TableCell>
                                    {asset.category?.name ?? (
                                        <span className="text-muted-foreground">Unassigned</span>
                                    )}
                                </TableCell>

                                <TableCell className="text-right space-x-2 flex items-center">
                                    <AssetStatusSelect
                                        assetId={asset.id}
                                        currentStatus={asset.status}
                                        isUpdating={updatingIds.has(asset.id)}
                                        onStart={() => markUpdating(asset.id)}
                                        onEnd={() => unmarkUpdating(asset.id)}
                                        onOptimisticUpdate={(status) => onAssetUpdated(asset.id, { status })}
                                    />
                                    <EditAssetDialog
                                        asset={asset}
                                        categories={categoriesToRender}
                                        isUpdating={updatingIds.has(asset.id)}
                                        key={asset.id}
                                        onOptimisticUpdate={(updates) => onAssetUpdated(asset.id, updates)}
                                    >
                                        <Button size="icon" variant="outline" className="h-8 w-8">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </EditAssetDialog>

                                    <DeleteAssetDialog asset={asset} onDelete={onAssetDeleted}>
                                        <Button size="icon" variant="destructive" className="h-8 w-8">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </DeleteAssetDialog>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}