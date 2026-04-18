"use server"

import { z } from "zod"
import { createValidatedAction } from "@/lib/validated-action"
import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { assetCategoryService } from "@/features/asset-category/asset-category.service"
import { revalidatePath } from "next/cache"

export const editCategoryAction = createValidatedAction(
    z.object({
        id: z.string(),
        name: z.string().trim().min(1, "Category name is required").max(30, "Category name too long"),
    }),
    async (data) => {
        const { session, workspace } = await getWorkspaceContext()

        await assetCategoryService.updateCategory({
            userId: session.user.id,
            workspaceId: workspace.id,
            categoryId: data.id,
            name: data.name.trim(),
        })

        revalidatePath("/categories")
        revalidatePath("/assets")
    }
)
