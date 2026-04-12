"use client"

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
import { Asset, Category } from "@/features/asset/asset-types"
import { use } from "react"
import AssetsEmptyState from "./assets-empty-state"

export default function AssetsTable({
    assetsPromise,
    categoriesPromise,
}: {
    assetsPromise: Promise<Asset[]>
    categoriesPromise: Promise<Category[]>
}) {
    const assets = use(assetsPromise)
    const categories = use(categoriesPromise)

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
                    {assets.map(asset => (
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
                                />
                                <EditAssetDialog
                                    asset={asset}
                                    categories={categories}
                                    key={`${asset.id}-${asset.name}-${asset.categoryId}-${asset.status}`}
                                >
                                    <Button size="icon" variant="outline" className="h-8 w-8">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </EditAssetDialog>

                                <DeleteAssetDialog asset={asset}>
                                    <Button size="icon" variant="destructive" className="h-8 w-8">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </DeleteAssetDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}