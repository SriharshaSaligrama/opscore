// SelectWorkspace.tsx
import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { workspaceService } from "@/features/workspace/workspace.service"
import SelectWorkspaceClient from "./SelectWorkspaceClient"

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

    if (memberships.length === 1) {
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
        />
    )
}