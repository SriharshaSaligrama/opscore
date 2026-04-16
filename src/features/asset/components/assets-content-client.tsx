"use client"

import { useState } from "react"
import PageHeader from "@/components/layout/page-header"
import AssetsHeaderActions from "./assets-header-actions"
import AssetsTable from "./assets-table"
import { Asset, Category } from "@/features/asset/asset-types"

export default function AssetsContentClient({
    initialAssets,
    categories,
}: {
    initialAssets: Asset[]
    categories: Category[]
}) {
    const [assets, setAssets] = useState<Asset[]>(initialAssets)

    function handleAssetCreated(asset: Asset) {
        setAssets((prev) => [...prev, asset])
    }

    function handleAssetUpdated(id: string, updates: Partial<Asset>) {
        setAssets((prev) =>
            prev.map((asset) =>
                asset.id === id ? { ...asset, ...updates } : asset
            )
        )
    }

    function handleAssetDeleted(id: string) {
        setAssets((prev) => prev.filter((asset) => asset.id !== id))
    }

    return (
        <>
            <PageHeader
                title="Assets"
                description="Manage your workspace assets"
                actions={
                    <AssetsHeaderActions
                        categories={categories}
                        onCreate={handleAssetCreated}
                    />
                }
            />

            <AssetsTable
                assets={assets}
                categories={categories}
                onAssetUpdated={handleAssetUpdated}
                onAssetDeleted={handleAssetDeleted}
            />
        </>
    )
}
