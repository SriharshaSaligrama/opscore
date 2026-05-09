import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { workspaceService } from "@/features/workspace/workspace.service"
import { can } from "@/features/authorization/capabilities"
import { Permission } from "@/features/authorization/permissions"
import { workspaceRepository } from "@/features/workspace/workspace.repository"
import SelectWorkspaceClient from "./select-workspace-client"

export default async function SelectWorkspace() {
    const session = await getCurrentSession()

    if (!session) redirect("/login")

    const memberships = await workspaceRepository.listMembershipWorkspaces(session.user.id)

    if (memberships.length === 0) {
        redirect("/no-workspace")
    }

    const userCanCreate = can(memberships[0]?.role, Permission.CREATE_WORKSPACE)

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
