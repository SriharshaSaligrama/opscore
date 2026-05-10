/**
 * Workspace context.
 *
 * Capabilities are derived by spreading getWorkspaceCapabilities() directly
 * into the returned object. Adding a new permission to capabilities.ts
 * automatically makes it available here without a manual wiring step.
 */

import { workspaceService } from "./workspace.service"
import { cache } from "react"
import { redirect } from "next/navigation"
import { getAuthContext } from "@/features/auth/auth.context"
import { getWorkspaceCapabilities } from "@/features/authorization/capabilities"
import { workspaceRepository } from "@/features/workspace/workspace.repository"

export const getWorkspaceContext = cache(async function () {
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

    const membership = await workspaceRepository.findMembership(
        session.user.id,
        workspace.id
    )

    // Spread the full capabilities object — any new permission added to
    // getWorkspaceCapabilities() is automatically available to all consumers.
    const capabilities = getWorkspaceCapabilities(membership?.role)

    return {
        session,
        workspace,
        membershipWorkspaces,
        user,
        membership,
        ...capabilities,
    }
})
