import { workspaceService } from "@/features/workspace/workspace.service"
import { getCurrentSession } from "@/lib/auth"

export async function DashboardContent() {
    const session = await getCurrentSession()

    const workspace = await workspaceService.getActiveWorkSpaceDetails(session!.activeWorkspaceId!)

    return (
        <div>
            <h1>Dashboard</h1>
            <p>You are authenticated.</p>
            {workspace.name && <p>Active Workspace: {workspace.name}</p>}
        </div>
    )
}