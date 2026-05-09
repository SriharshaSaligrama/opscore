import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { assetQueries } from "@/features/asset/asset.queries"
import { assetCategoryQueries } from "@/features/asset-category/asset-category.queries"

import AssetsContentClient from "./assets-content-client"

export default async function AssetsContent() {
    const {
        session,
        workspace,
        canCreateAsset,
        canUpdateAsset,
        canArchiveAsset,
    } = await getWorkspaceContext()

    const assets = await assetQueries.listWorkspaceAssets({
        userId: session.user.id,
        workspaceId: workspace.id,
    })

    const categories = await assetCategoryQueries.listWorkspaceCategories({
        userId: session.user.id,
        workspaceId: workspace.id,
    })

    return (
        <AssetsContentClient
            initialAssets={assets}
            categories={categories}
            capabilities={{
                canCreateAsset,
                canUpdateAsset,
                canArchiveAsset,
            }}
        />
    )
}
