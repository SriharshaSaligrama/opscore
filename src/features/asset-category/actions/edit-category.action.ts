"use server"

import { z } from "zod"
import { assetCategoryService } from "@/features/asset-category/asset-category.service"
import { CategoryActionState } from "@/features/asset-category/types/asset-category-types"
import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { revalidatePath } from "next/cache"
import { AppError } from "@/lib/errors"

export async function editCategoryAction(
    _: CategoryActionState,
    formData: FormData
): Promise<CategoryActionState> {
    try {
        const parsed = z.object({
            id: z.string(),
            name: z.string(),
        }).safeParse({
            id: formData.get("id"),
            name: formData.get("name"),
        })

        if (!parsed.success)
            return { success: false, error: "Invalid input" }

        const { session, workspace } = await getWorkspaceContext()

        await assetCategoryService.updateCategory({
            userId: session.user.id,
            workspaceId: workspace.id,
            categoryId: parsed.data.id,
            name: parsed.data.name,
        })

        revalidatePath("/categories")

        return { success: true, error: null }

    } catch (err) {
        if (err instanceof AppError)
            return { success: false, error: err.message }

        return { success: false, error: "Failed to update category" }
    }
}
