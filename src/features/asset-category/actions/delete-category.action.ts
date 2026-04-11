"use server"

import { handleAction } from "@/lib/action-handler"
import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { assetCategoryService } from "@/features/asset-category/asset-category.service"
import { revalidatePath } from "next/cache"

export async function deleteCategoryAction(
    _: unknown,
    formData: FormData
) {
    return handleAction(async () => {
        const id = formData.get("id") as string

        const { session, workspace } = await getWorkspaceContext()

        await assetCategoryService.deleteCategory({
            userId: session.user.id,
            workspaceId: workspace.id,
            categoryId: id,
        })

        revalidatePath("/categories")
    })
}