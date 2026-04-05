import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { assetCategoryService } from "@/features/asset-category/asset-category.service"
import AssetsHeaderActions from "./assets-header-actions"

export default async function AssetsHeaderActionsServer() {
    const { session, workspace } = await getWorkspaceContext()

    const categories = await assetCategoryService.listCategories({
        userId: session.user.id,
        workspaceId: workspace.id,
    })

    return <AssetsHeaderActions categories={categories} />
}