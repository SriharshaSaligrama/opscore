"use server"

import { z } from "zod"
import { assetService } from "@/features/asset/asset.service"
import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { ActionState } from "@/types/action-state"
import { AssetStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

const schema = z.object({
    id: z.string(),
    status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE", "RETIRED"]),
})

export async function updateAssetStatusAction(
    _: ActionState | null,
    formData: FormData
) {
    const parsed = schema.safeParse({
        id: formData.get("id"),
        status: formData.get("status"),
    })

    if (!parsed.success) {
        return { success: false, error: "Invalid status" }
    }

    const { session, workspace } = await getWorkspaceContext()

    await assetService.updateAsset({
        userId: session.user.id,
        workspaceId: workspace.id,
        assetId: parsed.data.id,
        status: parsed.data.status as AssetStatus,
    })

    revalidatePath("/assets")

    return { success: true }
}