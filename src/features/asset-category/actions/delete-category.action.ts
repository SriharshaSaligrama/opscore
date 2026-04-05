"use server"

import { assetCategoryService } from "@/features/asset-category/asset-category.service"
import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { ActionState } from "@/types/action-state"
import { revalidatePath } from "next/cache"
import { AppError } from "@/lib/errors"

export async function deleteCategoryAction(
    _: ActionState,
    formData: FormData
): Promise<ActionState> {
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
