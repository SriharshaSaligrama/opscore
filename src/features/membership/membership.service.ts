import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { ForbiddenError, NotFoundError } from "@/lib/errors"

import { findMembership, countWorkspaceOwners } from "./membership.repository"
import { authorizationService } from "@/features/authorization/authorization.service"

import { domainEventService } from "@/features/domain-events/domain-event.service"
import { domainEvents } from "@/features/domain-events/domain-event.builders"
import { runWorkspaceMutation } from "@/lib/service-mutation"

export const membershipService = {
    async listMembers(workspaceId: string) {
        return prisma.membership.findMany({
            where: { workspaceId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        })
    },

    async addMember({
        workspaceId,
        userId,
        role,
        actorId
    }: {
        workspaceId: string
        userId: string
        role: Role
        actorId: string
    }) {
        return runWorkspaceMutation(async (db) => {
            const membership = await db.membership.create({
                data: {
                    workspaceId,
                    userId,
                    role,
                },
            })

            return membership
        }, {
            uniqueConflictMessage: "User is already a member",
            event: (_membership, db) => domainEventService.record({
                db,
                ...domainEvents.memberAdded({
                    workspaceId,
                    actorId,
                    userId,
                    role,
                }),
            }),
        })
    },
    async removeMember({
        workspaceId,
        userId,
        actorId
    }: {
        workspaceId: string
        userId: string
        actorId: string
    }) {
        const actor = await authorizationService.ensureMembership(actorId, workspaceId)

        const target = await findMembership(userId, workspaceId)
        if (!target) throw new NotFoundError("Membership not found")

        authorizationService.ensureCanManageRole(actor.role, target.role)

        if (actor.userId === userId) {
            throw new ForbiddenError("You cannot remove yourself from the workspace")
        }

        if (target.role === "OWNER") {
            const ownerCount = await countWorkspaceOwners(workspaceId)
            if (ownerCount <= 1) {
                throw new ForbiddenError("Cannot remove the last workspace owner")
            }
        }

        await runWorkspaceMutation(async (db) => {
            await db.membership.delete({
                where: { userId_workspaceId: { userId, workspaceId } },
            })

        }, {
            event: (_result, db) => domainEventService.record({
                db,
                ...domainEvents.memberRemoved({ workspaceId, actorId, userId }),
            }),
        })
    },
    async changeMemberRole({
        workspaceId,
        userId,
        role,
        actorId
    }: {
        workspaceId: string
        userId: string
        role: Role
        actorId: string
    }) {
        const actor = await authorizationService.ensureMembership(actorId, workspaceId)

        const target = await findMembership(userId, workspaceId)
        if (!target) throw new NotFoundError("Membership not found")

        if (actor.userId === userId) {
            throw new ForbiddenError("You cannot change your own role")
        }

        authorizationService.ensureCanManageRole(actor.role, target.role)
        authorizationService.ensureCanManageRole(actor.role, role)

        if (target.role === "OWNER" && role !== "OWNER") {
            const ownerCount = await countWorkspaceOwners(workspaceId)
            if (ownerCount <= 1) {
                throw new ForbiddenError("Cannot demote the last workspace owner")
            }
        }

        return runWorkspaceMutation(async (db) => {
            const updated = await db.membership.update({
                where: {
                    userId_workspaceId: { userId, workspaceId }
                },
                data: { role }
            })

            return updated
        }, {
            event: (_membership, db) => domainEventService.record({
                db,
                ...domainEvents.memberRoleChanged({
                    workspaceId,
                    actorId,
                    userId,
                    newRole: role,
                }),
            }),
        })
    }
}
