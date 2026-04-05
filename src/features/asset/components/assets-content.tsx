import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { assetService } from "@/features/asset/asset.service"
import { assetCategoryService } from "@/features/asset-category/asset-category.service"

import AssetsTable from "./assets-table"
import AssetsEmptyState from "./assets-empty-state"

export default async function AssetsContent() {
    const { session, workspace } = await getWorkspaceContext()

    const [assets, categories] = await Promise.all([
        assetService.listAssets({
            userId: session.user.id,
            workspaceId: workspace.id,
        }),
        assetCategoryService.listCategories({
            userId: session.user.id,
            workspaceId: workspace.id,
        }),
    ])

    if (assets.length === 0) {
        return <AssetsEmptyState />
    }

    return <AssetsTable assets={assets} categories={categories} />
}