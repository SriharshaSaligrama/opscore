import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { assetCategoryService } from "@/features/asset-category/asset-category.service"
import CategoriesEmpty from "./categories-empty"
import CategoriesTableClient from "./categories-table-client"

export default async function CategoriesContent() {
    const { session, workspace } = await getWorkspaceContext()

    const categories = await assetCategoryService.listCategories({
        userId: session.user.id,
        workspaceId: workspace.id,
    })

    if (categories.length === 0) {
        return <CategoriesEmpty />
    }

    return <CategoriesTableClient categories={categories} />
}