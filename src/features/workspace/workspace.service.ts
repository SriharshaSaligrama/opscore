import { prisma } from "@/lib/prisma"
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors"
import { getServiceContext } from "@/lib/service-context"
import { Permission } from "@/features/authorization/permissions"
import { authService } from "@/features/auth/auth.service"
import { domainEventService } from "@/features/domain-events/domain-event.service"
import { DomainEventType } from "@/features/domain-events/domain-event.types"
import { DomainEntityType } from "@prisma/client"

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
    },

    async renameWorkspace({
        workspaceId,
        name,
        actorId
    }: {
        workspaceId: string
        name: string
        actorId: string
    }) {
        const ctx = await getServiceContext(
            actorId,
            workspaceId,
            Permission.MANAGE_WORKSPACE
        )

        const workspace = await prisma.workspace.findUnique({
            where: { id: ctx.membership.workspaceId },
        })

        if (!workspace) {
            throw new NotFoundError("Workspace not found")
        }

        if (workspace.name === name) {
            return workspace
        }

        const existing = await prisma.workspace.findFirst({
            where: {
                name,
                NOT: { id: workspaceId }
            }
        })

        if (existing) {
            throw new ConflictError("Workspace name already exists")
        }

        name = name.trim()

        if (!name) {
            throw new BadRequestError("Workspace name cannot be empty")
        }

        if (name.length > 120) {
            throw new BadRequestError("Workspace name too long")
        }

        const updatedWorkspace = await prisma.workspace.update({
            where: { id: ctx.membership.workspaceId },
            data: { name },
        })

        await domainEventService.record({
            workspaceId: ctx.membership.workspaceId,
            entityType: DomainEntityType.WORKSPACE,
            entityId: ctx.membership.workspaceId,
            actorId: ctx.membership.userId,
            type: DomainEventType.WORKSPACE_RENAMED,
            metadata: {
                oldName: workspace.name,
                newName: name
            },
        })

        return updatedWorkspace
    }
}