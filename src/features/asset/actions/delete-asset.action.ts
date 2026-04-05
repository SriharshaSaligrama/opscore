"use server"

import { assetService } from "@/features/asset/asset.service"
import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { ActionState } from "@/types/action-state"
import { AppError } from "@/lib/errors"
import { revalidatePath } from "next/cache"


export async function deleteAssetAction(
    _: ActionState,
    formData: FormData
): Promise<ActionState> {
    try {
        const id = formData.get("id") as string

        const { session, workspace } = await getWorkspaceContext()

        await assetService.archiveAsset({
            userId: session.user.id,
            workspaceId: workspace.id,
            assetId: id,
        })

        revalidatePath("/assets")

        return { success: true, error: null }

    } catch (err) {
        if (err instanceof AppError) {
            return { success: false, error: err.message }
        }

        return { success: false, error: "Failed to delete asset" }
    }
}
