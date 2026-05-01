"use server"

import { z } from "zod"
import { createValidatedAuthenticatedServerAction } from "@/lib/server-actions"
import { workspaceService } from "@/features/workspace/workspace.service"
import { invalidateWorkspaceSelection } from "@/features/workspace/workspace.cache"
import { workspaceNameSchema } from "@/features/workspace/workspace.schemas"

export const createWorkspaceAction = createValidatedAuthenticatedServerAction(
    z.object({
        name: workspaceNameSchema,
    }),
    async (data, { userId }) => {
        const workspace = await workspaceService.createWorkspace({
            userId,
            name: data.name,
        })

        invalidateWorkspaceSelection()

        return workspace
    }
)
