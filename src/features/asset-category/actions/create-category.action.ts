"use server"

import { z } from "zod"
import { createValidatedAction } from "@/lib/validated-action"
import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { assetCategoryService } from "@/features/asset-category/asset-category.service"
import { revalidatePath } from "next/cache"

export const createCategoryAction = createValidatedAction(
    z.object({
        name: z.string().trim().min(1),
    }),
    async (data) => {
        const { session, workspace } = await getWorkspaceContext()

        await assetCategoryService.createCategory({
            userId: session.user.id,
            workspaceId: workspace.id,
            name: data.name.trim(),
        })

        revalidatePath("/categories")
    }
)