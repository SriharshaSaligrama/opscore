"use server"

import { workspaceService } from "../workspace.service"
import { getCurrentSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AppError } from "@/lib/errors"

export async function selectWorkspaceAction(_: unknown, formData: FormData) {
    try {
        const workspaceId = formData.get("workspaceId") as string

        const session = await getCurrentSession()
        if (!session) redirect("/login")

        await workspaceService.selectWorkspace(
            session.sessionId,
            workspaceId
        )
    } catch (err) {
        if (err instanceof AppError) {
            return { error: err.message }
        }
        console.error(err)
        return { error: "Failed to select workspace" }
    }
    redirect("/dashboard")
}