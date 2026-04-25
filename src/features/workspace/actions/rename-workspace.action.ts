"use server"

import { z } from "zod"
import { createValidatedAction } from "@/lib/validated-action"
import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { workspaceService } from "@/features/workspace/workspace.service"
import { revalidatePath } from "next/cache"

export const renameWorkspaceAction = createValidatedAction(
    z.object({
        name: z.string().trim().min(1, "Workspace name is required").max(120, "Workspace name too long"),
    }),
    async (data) => {
        const { session, workspace } = await getWorkspaceContext()

        const updated = await workspaceService.renameWorkspace({
            workspaceId: workspace.id,
            name: data.name.trim(),
            actorId: session.user.id,
        })

        revalidatePath("/settings")

        return updated
    }
)