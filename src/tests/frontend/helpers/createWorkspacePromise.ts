// tests/frontend/helpers/createWorkspacePromise.ts
import type { WorkspacePromise } from "@/features/workspace/workspace.types"

export function createWorkspacePromise(): WorkspacePromise {
    return Promise.resolve({
        session: {
            sessionId: "test-session",
            user: {
                id: "user-1",
                name: "Test User",
                email: "test@example.com",
            },
            activeWorkspaceId: "1",
            expiresAt: new Date(),
        },
        user: {
            id: "user-1",
            name: "Test User",
            email: "test@example.com",
        },
        workspace: {
            id: "1",
            name: "Workspace A",
        },
        membershipWorkspaces: [
            { id: "1", name: "Workspace A" },
            { id: "2", name: "Workspace B" },
        ],
    })
}