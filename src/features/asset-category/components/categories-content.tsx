import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { assetCategoryService } from "@/features/asset-category/asset-category.service"
import CategoriesTable from "./categories-table"

export default async function CategoriesContent() {
    const { session, workspace } = await getWorkspaceContext()

    const categoriesPromise = assetCategoryService.listCategories({
        userId: session.user.id,
        workspaceId: workspace.id,
    })

    return <CategoriesTable categoriesPromise={categoriesPromise} />
}