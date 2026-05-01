"use server"

import { z } from "zod"
import { createValidatedWorkspaceServerAction } from "@/lib/server-actions"
import { assetService } from "@/features/asset/asset.service"
import { invalidateAssets } from "@/features/asset/asset.cache"
import { assetNameSchema } from "@/features/asset/asset.schemas"

export const createAssetAction = createValidatedWorkspaceServerAction(
    z.object({
        name: assetNameSchema,
        categoryId: z.string(),
    }),
    async (data, { userId, workspaceId }) => {
        const asset = await assetService.createAsset({
            userId,
            workspaceId,
            name: data.name,
            categoryId: data.categoryId,
        })

        invalidateAssets()

        return asset
    }
)
