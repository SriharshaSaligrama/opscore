"use client"

import PageHeader from "@/components/layout/page-header"
import AssetsHeaderActions from "./assets-header-actions"
import AssetsTable from "./assets-table"
import { Asset, Category } from "@/features/asset/asset-types"
import { useOptimisticCollection } from "@/hooks/use-optimistic-collection"

export default function AssetsContentClient({
    initialAssets,
    categories,
    capabilities,
}: {
    initialAssets: Asset[]
    categories: Category[]
    capabilities: {
        canCreateAsset: boolean
        canUpdateAsset: boolean
        canArchiveAsset: boolean
    }
}) {
    const assets = useOptimisticCollection<Asset>(initialAssets)

    return (
        <>
            <PageHeader
                title="Assets"
                description="Manage your workspace assets"
                actions={
                    capabilities.canCreateAsset ? (
                        <AssetsHeaderActions
                            categories={categories}
                            onCreate={assets.append}
                        />
                    ) : null
                }
            />

            <AssetsTable
                assets={assets.items}
                categories={categories}
                onAssetUpdated={assets.patch}
                onAssetDeleted={assets.remove}
                canUpdateAsset={capabilities.canUpdateAsset}
                canArchiveAsset={capabilities.canArchiveAsset}
            />
        </>
    )
}
