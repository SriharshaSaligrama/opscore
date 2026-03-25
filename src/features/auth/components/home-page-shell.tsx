import { getCurrentSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { workspaceService } from "@/features/workspace/workspace.service"

export default async function HomePageShell() {
    const session = await getCurrentSession()

    // ❌ Not logged in
    if (!session) {
        redirect("/login")
    }

    // 1️⃣ Validate active workspace via service
    if (session.activeWorkspaceId) {
        const hasAccess = await workspaceService.validateWorkspaceAccess(
            session.user.id,
            session.activeWorkspaceId
        )

        if (hasAccess) {
            redirect("/dashboard")
        }
    }

    // 2️⃣ Reuse service instead of Prisma
    const workspaces = await workspaceService.getUserWorkspaces(
        session.sessionId
    )

    if (workspaces.length === 0) {
        redirect("/no-workspace")
    }

    // 1 or many → let select-workspace handle
    redirect("/select-workspace")

    // If no redirect happens due to some race condition, render nothing.
    return null
}
