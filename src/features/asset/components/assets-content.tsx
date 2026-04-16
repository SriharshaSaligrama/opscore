import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { assetService } from "@/features/asset/asset.service"
import { assetCategoryService } from "@/features/asset-category/asset-category.service"

import AssetsContentClient from "./assets-content-client"

export default async function AssetsContent() {
    const { session, workspace } = await getWorkspaceContext()

    const assets = await assetService.listAssets({
        userId: session.user.id,
        workspaceId: workspace.id,
    })

    const categories = await assetCategoryService.listCategories({
        userId: session.user.id,
        workspaceId: workspace.id,
    })

    return <AssetsContentClient initialAssets={assets} categories={categories} />
}