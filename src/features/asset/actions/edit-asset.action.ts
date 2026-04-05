"use server"

import { z } from "zod"
import { assetService } from "@/features/asset/asset.service"
import { ASSET_STATUS_VALUES } from "@/features/asset/asset.constants"
import { AssetActionState } from "@/features/asset/types/asset-types"
import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { revalidatePath } from "next/cache"
import { AppError } from "@/lib/errors"
import { AssetStatus } from "@prisma/client"

const schema = z.object({
    id: z.string(),
    name: z.string().min(1),
    categoryId: z.string(),
    status: z.enum(ASSET_STATUS_VALUES),
})

export async function editAssetAction(
    prevState: AssetActionState | null,
    formData: FormData
) {
    try {
        const rawStatus = formData.get("status")

        const parsed = schema.safeParse({
            id: formData.get("id"),
            name: formData.get("name"),
            categoryId: formData.get("categoryId"),
            status:
                typeof rawStatus === "string"
                    ? rawStatus.trim().toUpperCase()
                    : rawStatus,
        })

        if (!parsed.success) {
            return { success: false, error: "Invalid input" }
        }

        const { session, workspace } = await getWorkspaceContext()

        await assetService.updateAsset({
            userId: session.user.id,
            workspaceId: workspace.id,
            assetId: parsed.data.id,
            name: parsed.data.name,
            categoryId: parsed.data.categoryId,
            status: parsed.data.status as AssetStatus,
        })

        revalidatePath("/assets")

        return { success: true, error: null }

    } catch (err) {
        if (err instanceof AppError) {
            return { success: false, error: err.message }
        }

        return { success: false, error: "Failed to update asset" }
    }
}