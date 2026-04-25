// WorkspaceSwitcher.tsx

import { use } from "react"
import { WorkspaceSwitcherView } from "./workspace-switcher-view"
import { WorkspacePromise } from "@/features/workspace/workspace.types"

export default function WorkspaceSwitcher({ workspacePromise }: { workspacePromise: WorkspacePromise }) {
    const { workspace, membershipWorkspaces, canCreateWorkspace } = use(workspacePromise)

    return (
        <WorkspaceSwitcherView
            workspace={workspace}
            membershipWorkspaces={membershipWorkspaces}
            canCreateWorkspace={canCreateWorkspace}
        />
    )
}