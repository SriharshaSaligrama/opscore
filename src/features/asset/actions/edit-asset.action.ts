"use server"

import { z } from "zod"
import { createValidatedAction } from "@/lib/validated-action"
import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { assetService } from "@/features/asset/asset.service"
import { revalidatePath } from "next/cache"
import { AssetStatus } from "@prisma/client"

export const editAssetAction = createValidatedAction(
    z.object({
        id: z.string(),
        name: z.string().min(1),
        categoryId: z.string(),
        status: z.enum(Object.values(AssetStatus)),
    }),
    async (data) => {
        const { session, workspace } = await getWorkspaceContext()

        await assetService.updateAsset({
            userId: session.user.id,
            workspaceId: workspace.id,
            assetId: data.id,
            name: data.name.trim(),
            categoryId: data.categoryId,
            status: data.status,
        })

        revalidatePath("/assets")
    }
)