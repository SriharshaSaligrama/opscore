import { prisma } from "@/lib/prisma"
import { DomainEntityType, Role } from "@prisma/client"
import { ForbiddenError, NotFoundError } from "@/lib/errors"

import { findMembership, countWorkspaceOwners } from "./membership.repository"
import { authorizationService } from "@/features/authorization/authorization.service"

import { domainEventService } from "@/features/domain-events/domain-event.service"
import { DomainEventType } from "@/features/domain-events/domain-event.types"

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
        const membership = await prisma.membership.create({
            data: {
                workspaceId,
                userId,
                role,
            },
        })

        await domainEventService.record({
            workspaceId,
            entityType: DomainEntityType.MEMBERSHIP,
            entityId: userId,
            actorId,
            type: DomainEventType.MEMBER_ADDED,
            metadata: { role },
        })

        return membership
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

        await prisma.membership.delete({
            where: { userId_workspaceId: { userId, workspaceId } },
        })

        await domainEventService.record({
            workspaceId,
            entityType: DomainEntityType.MEMBERSHIP,
            entityId: userId,
            actorId,
            type: DomainEventType.MEMBER_REMOVED,
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

        const updated = await prisma.membership.update({
            where: {
                userId_workspaceId: { userId, workspaceId }
            },
            data: { role }
        })

        await domainEventService.record({
            workspaceId,
            entityType: DomainEntityType.MEMBERSHIP,
            entityId: userId,
            actorId,
            type: DomainEventType.MEMBER_ROLE_CHANGED,
            metadata: { newRole: role },
        })

        return updated
    }
}