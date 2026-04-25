import { workspaceService } from "./workspace.service"
import { cache } from "react"
import { redirect } from "next/navigation"
import { getAuthContext } from "@/features/auth/auth.context"
import { prisma } from "@/lib/prisma"
import { RolePermissions, Permission } from "@/features/authorization/permissions"

function canCreateWorkspace(role: string | null): boolean {
    if (!role) return false
    const perms = RolePermissions[role as keyof typeof RolePermissions]
    return perms?.includes(Permission.CREATE_WORKSPACE) ?? false
}

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

    const membership = await prisma.membership.findUnique({
        where: {
            userId_workspaceId: {
                userId: session.user.id,
                workspaceId: workspace.id
            }
        }
    })

    return {
        session,
        workspace,
        membershipWorkspaces,
        user,
        canCreateWorkspace: canCreateWorkspace(membership?.role ?? null),
    }
})