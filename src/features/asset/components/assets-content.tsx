import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { assetService } from "@/features/asset/asset.service"
import { assetCategoryService } from "@/features/asset-category/asset-category.service"

import AssetsTable from "./assets-table"

export default async function AssetsContent() {
    const { session, workspace } = await getWorkspaceContext()

    const assetsPromise = assetService.listAssets({
        userId: session.user.id,
        workspaceId: workspace.id,
    })

    const categoriesPromise = assetCategoryService.listCategories({
        userId: session.user.id,
        workspaceId: workspace.id,
    })

    return <AssetsTable assetsPromise={assetsPromise} categoriesPromise={categoriesPromise} />
}