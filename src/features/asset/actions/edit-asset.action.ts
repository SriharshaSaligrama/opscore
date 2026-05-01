"use server"

import { z } from "zod"
import { createValidatedWorkspaceServerAction } from "@/lib/server-actions"
import { assetService } from "@/features/asset/asset.service"
import { invalidateAssets } from "@/features/asset/asset.cache"
import { AssetStatus } from "@prisma/client"
import { assetNameSchema } from "@/features/asset/asset.schemas"

export const editAssetAction = createValidatedWorkspaceServerAction(
    z.object({
        id: z.string(),
        name: assetNameSchema,
        categoryId: z.string(),
        status: z.enum(Object.values(AssetStatus)),
    }),
    async (data, { userId, workspaceId }) => {
        await assetService.updateAsset({
            userId,
            workspaceId,
            assetId: data.id,
            name: data.name,
            categoryId: data.categoryId,
            status: data.status,
        })

        invalidateAssets()
    }
)
