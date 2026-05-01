"use server"

import { assetService } from "@/features/asset/asset.service"
import { invalidateAssets } from "@/features/asset/asset.cache"
import { AssetStatus } from "@prisma/client"
import { createValidatedWorkspaceServerAction } from "@/lib/server-actions"
import { z } from "zod"

export const updateAssetStatusAction = createValidatedWorkspaceServerAction(
    z.object({
        id: z.string(),
        status: z.enum(Object.values(AssetStatus)),
    }),
    async (data, { userId, workspaceId }) => {
        await assetService.updateAsset({
            userId,
            workspaceId,
            assetId: data.id,
            status: data.status,
        })

        invalidateAssets()
    }
)
