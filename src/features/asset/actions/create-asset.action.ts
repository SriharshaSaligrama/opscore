"use server"

import { z } from "zod"
import { createValidatedAction } from "@/lib/validated-action"
import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { assetService } from "@/features/asset/asset.service"
import { revalidatePath } from "next/cache"

export const createAssetAction = createValidatedAction(
    z.object({
        name: z.string().trim().min(1),
        categoryId: z.string(),
    }),
    async (data) => {
        const { session, workspace } = await getWorkspaceContext()

        await assetService.createAsset({
            userId: session.user.id,
            workspaceId: workspace.id,
            name: data.name.trim(),
            categoryId: data.categoryId,
        })

        revalidatePath("/assets")
    }
)