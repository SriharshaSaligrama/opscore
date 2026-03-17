import { getWorkspaceContext } from "@/features/workspace/workspace.context"

export async function DashboardContent() {
    const { workspace } = await getWorkspaceContext()

    return (
        <div>
            <p>You are authenticated.</p>
            {workspace.name && <p>Active Workspace: {workspace.name}</p>}
        </div>
    )
}