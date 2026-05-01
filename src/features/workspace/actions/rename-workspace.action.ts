"use server"

import { z } from "zod"
import { createValidatedWorkspaceServerAction } from "@/lib/server-actions"
import { workspaceService } from "@/features/workspace/workspace.service"
import { invalidateWorkspaceSettings } from "@/features/workspace/workspace.cache"
import { workspaceNameSchema } from "@/features/workspace/workspace.schemas"

export const renameWorkspaceAction = createValidatedWorkspaceServerAction(
    z.object({
        name: workspaceNameSchema,
    }),
    async (data, { userId, workspaceId }) => {
        const updated = await workspaceService.renameWorkspace({
            workspaceId,
            name: data.name,
            actorId: userId,
        })

        invalidateWorkspaceSettings()

        return updated
    }
)
