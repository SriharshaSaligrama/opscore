"use server"

import { z } from "zod"
import { assetCategoryService } from "@/features/asset-category/asset-category.service"
import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { ActionState } from "@/types/action-state"
import { AppError } from "@/lib/errors"
import { revalidatePath } from "next/cache"


const schema = z.object({
    name: z.string(),
})

export async function createCategoryAction(
    _: ActionState,
    formData: FormData
): Promise<ActionState> {
    try {
        const parsed = schema.safeParse({
            name: formData.get("name"),
        })

        if (!parsed.success)
            return { success: false, error: "Invalid input" }

        const { session, workspace } = await getWorkspaceContext()

        await assetCategoryService.createCategory({
            userId: session.user.id,
            workspaceId: workspace.id,
            name: parsed.data.name,
        })

        revalidatePath("/categories")

        return { success: true, error: null }

    } catch (err) {
        if (err instanceof AppError)
            return { success: false, error: err.message }

        return { success: false, error: "Failed to create category" }
    }
}
