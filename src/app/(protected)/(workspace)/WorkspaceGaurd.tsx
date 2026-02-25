import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { workspaceService } from "@/features/workspace/workspace.service"

export default async function WorkspaceGuard() {
    const session = await getCurrentSession()

    if (!session) {
        redirect("/login")
    }

    if (!session.activeWorkspaceId) {
        redirect("/select-workspace")
    }

    const valid = await workspaceService.validateWorkspaceAccess(
        session.user.id,
        session.activeWorkspaceId
    )

    if (!valid) {
        redirect("/select-workspace")
    }

    return null
}