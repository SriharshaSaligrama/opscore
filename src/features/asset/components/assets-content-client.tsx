"use client"

import AssetsHeaderActions from "./assets-header-actions"
import AssetsTable from "./assets-table"
import { Asset, Category } from "@/features/asset/asset-types"
import { CollectionContentShell } from "@/components/data-table/collection-content-shell"

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
    return (
        <CollectionContentShell
            title="Assets"
            description="Manage your workspace assets"
            initialItems={initialAssets}
            actions={(assets) =>
                capabilities.canCreateAsset ? (
                    <AssetsHeaderActions
                        categories={categories}
                        onCreate={assets.append}
                    />
                ) : null
            }
        >
            {(assets) => (
                <AssetsTable
                    assets={assets.items}
                    categories={categories}
                    onAssetUpdated={assets.patch}
                    onAssetDeleted={assets.remove}
                    canUpdateAsset={capabilities.canUpdateAsset}
                    canArchiveAsset={capabilities.canArchiveAsset}
                />
            )}
        </CollectionContentShell>
    )
}
