import { prisma } from "@/lib/prisma"
import { ForbiddenError, NotFoundError } from "@/lib/errors"
import { authService } from "@/features/auth/auth.service"

export const workspaceService = {
    async selectWorkspace(
        sessionId: string,
        workspaceId: string
    ) {

        // 1️⃣ Fetch session
        const session = await authService.validateSession(sessionId)

        // 2️⃣ Validate membership
        const membership = await prisma.membership.findUnique({
            where: {
                userId_workspaceId: {
                    userId: session.userId,
                    workspaceId
                }
            },
            include: {
                workspace: true
            }
        })

        if (!membership) {
            throw new ForbiddenError("Invalid workspace")
        }

        // 3️⃣ Update session context
        await prisma.session.update({
            where: { id: sessionId },
            data: { activeWorkspaceId: workspaceId }
        })

        return {
            workspaceId: membership.workspace.id,
            workspaceName: membership.workspace.name
        }
    },

    async getUserWorkspaces(sessionId: string) {
        const session = await authService.validateSession(sessionId)

        const memberships = await prisma.membership.findMany({
            where: { userId: session.userId },
            include: { workspace: true }
        })

        return memberships.map(m => ({
            id: m.workspace.id,
            name: m.workspace.name
        }))
    },

    async validateWorkspaceAccess(
        userId: string,
        workspaceId: string
    ): Promise<boolean> {

        const membership = await prisma.membership.findUnique({
            where: {
                userId_workspaceId: {
                    userId,
                    workspaceId
                }
            }
        })

        return !!membership
    },

    async getActiveWorkSpaceDetails(workspaceId: string) {
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
        })

        if (!workspace) {
            throw new NotFoundError("Workspace not found")
        }

        return {
            id: workspace.id,
            name: workspace.name
        }
    }
}