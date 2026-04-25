import { getWorkspaceContext } from "./workspace.context"
import { Role } from "@prisma/client"

export type WorkspacePromise = ReturnType<typeof getWorkspaceContext>

export type WorkspaceInfo = {
    id: string
    name: string
}

export type MembershipWithRole = {
    workspace: WorkspaceInfo
    role: Role
}