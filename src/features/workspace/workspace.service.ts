import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
} from "@/lib/errors"
import { getServiceContext } from "@/lib/service-context"
import { Permission } from "@/features/authorization/permissions"
import { authService } from "@/features/auth/auth.service"
import { authRepository } from "@/features/auth/auth.repository"
import { Role } from "@prisma/client"
import { WORKSPACE_NAME_MAX_LENGTH } from "@/features/workspace/workspace.schemas"
import { runWorkspaceMutation } from "@/lib/service-mutation"
import { domainEvents } from "@/features/domain-events/domain-event.builders"
import { workspaceRepository } from "@/features/workspace/workspace.repository"

export const workspaceService = {
    async selectWorkspace(
        sessionId: string,
        workspaceId: string
    ) {

        // 1️⃣ Fetch session
        const session = await authService.validateSession(sessionId)

        // 2️⃣ Validate membership
        const membership = await workspaceRepository.findMembership(
            session.userId,
            workspaceId
        )

        if (!membership) {
            throw new ForbiddenError("Invalid workspace")
        }

        // 3️⃣ Update session context
        await authRepository.setActiveWorkspace(sessionId, workspaceId)

        return {
            workspaceId: membership.workspace.id,
            workspaceName: membership.workspace.name
        }
    },

    async getUserWorkspaces(sessionId: string) {
        const session = await authService.validateSession(sessionId)

        const memberships = await workspaceRepository.listMembershipWorkspaces(session.userId)

        return memberships.map(m => ({
            id: m.workspace.id,
            name: m.workspace.name
        }))
    },

    async validateWorkspaceAccess(
        userId: string,
        workspaceId: string
    ): Promise<boolean> {

        const membership = await workspaceRepository.findMembership(userId, workspaceId)

        return !!membership
    },

    async getActiveWorkSpaceDetails(workspaceId: string) {
        const workspace = await workspaceRepository.findById(workspaceId)

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

        const workspace = await workspaceRepository.findById(ctx.membership.workspaceId)

        if (!workspace) {
            throw new NotFoundError("Workspace not found")
        }

        if (workspace.name === name) {
            return workspace
        }

        const existing = await workspaceRepository.findByNameExcluding(name, workspaceId)

        if (existing) {
            throw new ConflictError("Workspace name already exists")
        }

        name = name.trim()

        if (!name) {
            throw new BadRequestError("Workspace name cannot be empty")
        }

        if (name.length > WORKSPACE_NAME_MAX_LENGTH) {
            throw new BadRequestError("Workspace name too long")
        }

        return runWorkspaceMutation(async (db) => {
            const updatedWorkspace = await db.workspace.update({
                where: { id: ctx.membership.workspaceId },
                data: { name },
            })

            return updatedWorkspace
        }, {
            event: () => domainEvents.workspaceRenamed({
                    workspaceId: ctx.membership.workspaceId,
                    actorId: ctx.membership.userId,
                    oldName: workspace.name,
                    newName: name,
            }),
        })
    },

    async createWorkspace({
        userId,
        name,
    }: {
        userId: string
        name: string
    }) {
        const normalizedName = name.trim()

        if (!normalizedName) {
            throw new BadRequestError("Workspace name is required")
        }

        if (normalizedName.length > WORKSPACE_NAME_MAX_LENGTH) {
            throw new BadRequestError("Workspace name too long")
        }

        const existing = await workspaceRepository.findByName(normalizedName)

        if (existing) {
            throw new ConflictError("Workspace name already exists")
        }

        const workspace = await runWorkspaceMutation(async (db) => {
            const workspace = await db.workspace.create({
                data: { name: normalizedName }
            })

            await db.membership.create({
                data: {
                    userId,
                    workspaceId: workspace.id,
                    role: Role.OWNER
                }
            })

            return workspace
        }, {
            event: (workspace) => domainEvents.workspaceCreated({
                    workspaceId: workspace.id,
                    actorId: userId,
                    name: workspace.name,
            }),
        })

        return {
            id: workspace.id,
            name: workspace.name
        }
    }
}
