"use server"

import { handleAction } from "@/lib/action-handler"
import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { assetService } from "../asset.service"
import { revalidatePath } from "next/cache"

export async function deleteAssetAction(
    _: unknown,
    formData: FormData
) {
    return handleAction(async () => {
        const id = formData.get("id") as string

        const { session, workspace } = await getWorkspaceContext()

        await assetService.archiveAsset({
            userId: session.user.id,
            workspaceId: workspace.id,
            assetId: id,
        })

        revalidatePath("/assets")
    })
}