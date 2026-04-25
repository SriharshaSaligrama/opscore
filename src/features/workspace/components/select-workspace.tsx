// SelectWorkspace.tsx
import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { workspaceService } from "@/features/workspace/workspace.service"
import { RolePermissions, Permission } from "@/features/authorization/permissions"
import SelectWorkspaceClient from "./select-workspace-client"

function canCreateWorkspace(role: string | null): boolean {
    if (!role) return false
    const perms = RolePermissions[role as keyof typeof RolePermissions]
    return perms?.includes(Permission.CREATE_WORKSPACE) ?? false
}

export default async function SelectWorkspace() {
    const session = await getCurrentSession()

    if (!session) redirect("/login")

    const memberships = await prisma.membership.findMany({
        where: { userId: session.user.id },
        include: { workspace: true },
    })

    if (memberships.length === 0) {
        redirect("/no-workspace")
    }

    const userCanCreate = canCreateWorkspace(memberships[0]?.role ?? null)

    if (memberships.length === 1) {
        // If user can create workspace, show them the page with create dialog
        if (userCanCreate) {
            return (
                <SelectWorkspaceClient
                    workspaces={memberships.map(m => ({
                        id: m.workspace.id,
                        name: m.workspace.name,
                    }))}
                    canCreateWorkspace={true}
                    initialCreateOpen={true}
                />
            )
        }
        // Otherwise redirect to dashboard
        await workspaceService.selectWorkspace(
            session.sessionId,
            memberships[0].workspaceId
        )
        redirect("/dashboard")
    }

    return (
        <SelectWorkspaceClient
            workspaces={memberships.map(m => ({
                id: m.workspace.id,
                name: m.workspace.name,
            }))}
            canCreateWorkspace={userCanCreate}
        />
    )
}