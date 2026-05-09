import { Role } from "@prisma/client"
import { ForbiddenError, NotFoundError } from "@/lib/errors"

import {
    listWorkspaceMembers,
    membershipRepository,
} from "./membership.repository"
import { authorizationService } from "@/features/authorization/authorization.service"

import { domainEvents } from "@/features/domain-events/domain-event.builders"
import { runWorkspaceMutation } from "@/lib/service-mutation"

export const membershipService = {
    async listMembers(workspaceId: string) {
        return listWorkspaceMembers(workspaceId)
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
            event: () => domainEvents.memberAdded({
                    workspaceId,
                    actorId,
                    userId,
                    role,
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
        await runWorkspaceMutation(async (db) => {
            const actor = await authorizationService.ensureMembership(actorId, workspaceId, db)

            const target = await membershipRepository.findMembership(userId, workspaceId, db)
            if (!target) throw new NotFoundError("Membership not found")

            authorizationService.ensureCanManageRole(actor.role, target.role)

            if (actor.userId === userId) {
                throw new ForbiddenError("You cannot remove yourself from the workspace")
            }

            if (target.role === "OWNER") {
                const ownerCount = await membershipRepository.countWorkspaceOwners(workspaceId, db)
                if (ownerCount <= 1) {
                    throw new ForbiddenError("Cannot remove the last workspace owner")
                }
            }

            await db.membership.delete({
                where: { userId_workspaceId: { userId, workspaceId } },
            })

        }, {
            event: () => domainEvents.memberRemoved({ workspaceId, actorId, userId }),
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
        return runWorkspaceMutation(async (db) => {
            const actor = await authorizationService.ensureMembership(actorId, workspaceId, db)

            const target = await membershipRepository.findMembership(userId, workspaceId, db)
            if (!target) throw new NotFoundError("Membership not found")

            if (actor.userId === userId) {
                throw new ForbiddenError("You cannot change your own role")
            }

            authorizationService.ensureCanManageRole(actor.role, target.role)
            authorizationService.ensureCanManageRole(actor.role, role)

            if (target.role === "OWNER" && role !== "OWNER") {
                const ownerCount = await membershipRepository.countWorkspaceOwners(workspaceId, db)
                if (ownerCount <= 1) {
                    throw new ForbiddenError("Cannot demote the last workspace owner")
                }
            }

            const updated = await db.membership.update({
                where: {
                    userId_workspaceId: { userId, workspaceId }
                },
                data: { role }
            })

            return updated
        }, {
            event: () => domainEvents.memberRoleChanged({
                    workspaceId,
                    actorId,
                    userId,
                    newRole: role,
            }),
        })
    }
}
