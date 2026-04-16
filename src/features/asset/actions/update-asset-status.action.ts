"use server"

import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { assetService } from "@/features/asset/asset.service"
import { revalidatePath } from "next/cache"
import { AssetStatus } from "@prisma/client"
import { createValidatedAction } from "@/lib/validated-action"
import { z } from "zod"

export const updateAssetStatusAction = createValidatedAction(
    z.object({
        id: z.string(),
        status: z.enum(Object.values(AssetStatus)),
    }),
    async (data) => {
        const { session, workspace } = await getWorkspaceContext()

        await assetService.updateAsset({
            userId: session.user.id,
            workspaceId: workspace.id,
            assetId: data.id,
            status: data.status,
        })

        revalidatePath("/assets")
    }
)
