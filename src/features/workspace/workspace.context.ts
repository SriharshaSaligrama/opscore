import { workspaceService } from "./workspace.service"
import { cache } from "react"
import { redirect } from "next/navigation"
import { getAuthContext } from "@/features/auth/auth.context"
import { WorkspacePromise } from "./workspace.types"

export const getWorkspaceContext = cache(async function (): WorkspacePromise {
    const { session, user } = await getAuthContext()

    if (!session.activeWorkspaceId) {
        redirect("/select-workspace")
    }

    const membershipWorkspaces = await workspaceService.getUserWorkspaces(session.sessionId)

    if (!membershipWorkspaces.length) {
        redirect("/no-workspace")
    }

    const workspace = membershipWorkspaces.find(w => w.id === session.activeWorkspaceId)

    if (!workspace) {
        redirect("/select-workspace")
    }

    return {
        session,
        workspace,
        membershipWorkspaces,
        user,
    }
})