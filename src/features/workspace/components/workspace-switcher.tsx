// WorkspaceSwitcher.tsx (UNCHANGED STRUCTURE)

import { use } from "react"
import { WorkspaceSwitcherView } from "./workspace-switcher-view"
import { WorkspacePromise } from "@/features/workspace/workspace.types"

export default function WorkspaceSwitcher({ workspacePromise }: { workspacePromise: WorkspacePromise }) {
    const { workspace, membershipWorkspaces } = use(workspacePromise)

    return (
        <WorkspaceSwitcherView
            workspace={workspace}
            membershipWorkspaces={membershipWorkspaces}
        />
    )
}