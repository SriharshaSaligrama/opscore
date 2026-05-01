"use server"

import { createWorkspaceServerAction } from "@/lib/server-actions"
import { assetCategoryService } from "@/features/asset-category/asset-category.service"
import { invalidateCategoriesAndAssets } from "@/features/asset-category/asset-category.cache"

export const deleteCategoryAction = createWorkspaceServerAction(
    async ({ userId, workspaceId }, formData) => {
        const id = formData.get("id") as string

        await assetCategoryService.deleteCategory({
            userId,
            workspaceId,
            categoryId: id,
        })

        invalidateCategoriesAndAssets()
    }
)
