import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { assetCategoryQueries } from "@/features/asset-category/asset-category.queries"
import CategoriesContentClient from "./categories-content-client"

export default async function CategoriesContent() {
    const {
        session,
        workspace,
        canCreateCategory,
        canUpdateCategory,
        canArchiveCategory,
    } = await getWorkspaceContext()

    const categories = await assetCategoryQueries.listWorkspaceCategories({
        userId: session.user.id,
        workspaceId: workspace.id,
    })

    return (
        <CategoriesContentClient
            initialCategories={categories}
            capabilities={{
                canCreateCategory,
                canUpdateCategory,
                canArchiveCategory,
            }}
        />
    )
}
