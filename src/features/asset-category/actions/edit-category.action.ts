"use server"

import { z } from "zod"
import { createValidatedWorkspaceServerAction } from "@/lib/server-actions"
import { assetCategoryService } from "@/features/asset-category/asset-category.service"
import { invalidateCategoriesAndAssets } from "@/features/asset-category/asset-category.cache"
import { categoryNameSchema } from "@/features/asset-category/asset-category.schemas"

export const editCategoryAction = createValidatedWorkspaceServerAction(
    z.object({
        id: z.string(),
        name: categoryNameSchema,
    }),
    async (data, { userId, workspaceId }) => {
        await assetCategoryService.updateCategory({
            userId,
            workspaceId,
            categoryId: data.id,
            name: data.name,
        })

        invalidateCategoriesAndAssets()
    }
)
