"use server"

import { assetCategoryService } from "@/features/asset-category/asset-category.service"
import { CategoryActionState } from "@/features/asset-category/types/asset-category-types"
import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { revalidatePath } from "next/cache"
import { AppError } from "@/lib/errors"

export async function deleteCategoryAction(
    _: CategoryActionState,
    formData: FormData
): Promise<CategoryActionState> {
    try {
        const id = formData.get("id") as string

        const { session, workspace } = await getWorkspaceContext()

        await assetCategoryService.deleteCategory({
            userId: session.user.id,
            workspaceId: workspace.id,
            categoryId: id,
        })

        revalidatePath("/categories")

        return { success: true, error: null }

    } catch (err) {
        if (err instanceof AppError)
            return { success: false, error: err.message }

        return { success: false, error: "Failed to delete category" }
    }
}
