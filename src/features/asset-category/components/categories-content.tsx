import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { assetCategoryService } from "@/features/asset-category/asset-category.service"
import CategoriesContentClient from "./categories-content-client"

export default async function CategoriesContent() {
    const { session, workspace } = await getWorkspaceContext()

    const categories = await assetCategoryService.listCategories({
        userId: session.user.id,
        workspaceId: workspace.id,
    })

    return <CategoriesContentClient initialCategories={categories} />
}