"use server"

import { workspaceService } from "./workspace.service"
import { getAuthContext } from "@/features/auth/auth.context"
import { revalidatePath } from "next/cache"

export async function selectWorkspace(workspaceId: string) {
    const { session } = await getAuthContext()

    await workspaceService.selectWorkspace(
        session.sessionId,
        workspaceId
    )

    revalidatePath("/", "layout")
}