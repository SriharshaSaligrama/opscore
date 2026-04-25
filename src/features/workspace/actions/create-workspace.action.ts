"use server"

import { z } from "zod"
import { createValidatedAction } from "@/lib/validated-action"
import { getAuthContext } from "@/features/auth/auth.context"
import { workspaceService } from "@/features/workspace/workspace.service"
import { revalidatePath } from "next/cache"

export const createWorkspaceAction = createValidatedAction(
    z.object({
        name: z.string().trim().min(1, "Workspace name is required").max(120, "Workspace name too long"),
    }),
    async (data) => {
        const { session } = await getAuthContext()

        const workspace = await workspaceService.createWorkspace({
            userId: session.user.id,
            name: data.name.trim(),
        })

        revalidatePath("/select-workspace")

        return workspace
    }
)