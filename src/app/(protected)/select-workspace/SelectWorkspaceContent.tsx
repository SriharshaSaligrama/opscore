import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { workspaceService } from "@/features/workspace/workspace.service"

export default async function SelectWorkspaceContent() {
    const session = await getCurrentSession()

    if (!session) redirect("/login")

    const memberships = await prisma.membership.findMany({
        where: { userId: session.user.id },
        include: { workspace: true }
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
        <div style={{ padding: 40 }}>
            <h1>Select Workspace</h1>

            {memberships.map(m => (
                <form
                    key={m.workspace.id}
                    action="/api/workspaces/select"
                    method="POST"
                    style={{ marginTop: 12 }}
                >
                    <input
                        type="hidden"
                        name="workspaceId"
                        value={m.workspace.id}
                    />

                    <button type="submit">
                        {m.workspace.name}
                    </button>
                </form>
            ))}
        </div>
    )
}