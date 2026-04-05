"use server"

import { z } from "zod"
import { assetService } from "@/features/asset/asset.service"
import { AssetActionState } from "@/features/asset/types/asset-types"
import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { AppError } from "@/lib/errors"
import { revalidatePath } from "next/cache"

const schema = z.object({
    name: z.string(),
    categoryId: z.string(),
})

export async function createAssetAction(
    _: AssetActionState,
    formData: FormData
): Promise<AssetActionState> {
    try {
        const parsed = schema.safeParse({
            name: formData.get("name"),
            categoryId: formData.get("categoryId"),
        })

        if (!parsed.success) {
            return { success: false, error: "Invalid input" }
        }

        const { session, workspace } = await getWorkspaceContext()

        await assetService.createAsset({
            userId: session.user.id,
            workspaceId: workspace.id,
            name: parsed.data.name,
            categoryId: parsed.data.categoryId,
        })

        revalidatePath("/assets")

        return { success: true, error: null }

    } catch (err) {
        if (err instanceof AppError) {
            return { success: false, error: err.message }
        }

        return { success: false, error: "Failed to create asset" }
    }
}
