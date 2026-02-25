import { prisma } from "@/lib/prisma"
import { UnauthorizedError, ForbiddenError } from "@/lib/errors"

export const workspaceService = {
    async selectWorkspace(
        sessionId: string,
        workspaceId: string
    ): Promise<{ workspaceId: string; workspaceName: string }> {

        // 1️⃣ Fetch session
        const session = await prisma.session.findUnique({
            where: { id: sessionId }
        })

        if (!session) {
            throw new UnauthorizedError("Session not found")
        }

        if (session.expiresAt < new Date()) {
            throw new UnauthorizedError("Session expired")
        }

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
        const session = await prisma.session.findUnique({
            where: { id: sessionId }
        })

        if (!session || session.expiresAt < new Date()) {
            throw new UnauthorizedError("Session expired")
        }

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
    }
}