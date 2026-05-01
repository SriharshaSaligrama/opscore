"use server"

import { createWorkspaceServerAction } from "@/lib/server-actions"
import { assetService } from "@/features/asset/asset.service"
import { invalidateAssets } from "@/features/asset/asset.cache"

export const deleteAssetAction = createWorkspaceServerAction(
    async ({ userId, workspaceId }, formData) => {
        const id = formData.get("id") as string

        await assetService.archiveAsset({
            userId,
            workspaceId,
            assetId: id,
        })

        invalidateAssets()

        return id
    }
)
