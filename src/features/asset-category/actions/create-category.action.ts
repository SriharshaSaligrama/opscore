"use server"

import { z } from "zod"
import { createValidatedWorkspaceServerAction } from "@/lib/server-actions"
import { assetCategoryService } from "@/features/asset-category/asset-category.service"
import { invalidateCategoriesAndAssets } from "@/features/asset-category/asset-category.cache"
import { categoryNameSchema } from "@/features/asset-category/asset-category.schemas"

export const createCategoryAction = createValidatedWorkspaceServerAction(
    z.object({
        name: categoryNameSchema,
    }),
    async (data, { userId, workspaceId }) => {
        const category = await assetCategoryService.createCategory({
            userId,
            workspaceId,
            name: data.name,
        })

        invalidateCategoriesAndAssets()

        return category
    }
)
