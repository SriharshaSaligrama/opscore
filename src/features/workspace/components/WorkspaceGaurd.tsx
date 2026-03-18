import { getWorkspaceContext } from "@/features/workspace/workspace.context"

export default async function WorkspaceGuard() {
    await getWorkspaceContext()

    return null
}