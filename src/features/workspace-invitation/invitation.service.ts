import crypto from "crypto"
import { Role } from "@prisma/client"
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors"
import { prisma } from "@/lib/prisma"

import { invitationRepository } from "./invitation.repository"
import { membershipService } from "@/features/membership/membership.service"
import { authorizationService } from "@/features/authorization/authorization.service"
import { Permission } from "@/features/authorization/permissions"

import { domainEventService } from "@/features/domain-events/domain-event.service"
import { domainEvents } from "@/features/domain-events/domain-event.builders"
import { runWorkspaceMutation } from "@/lib/service-mutation"

function generateToken() {
    return crypto.randomBytes(32).toString("hex")
}

function expiresInDays(days: number) {
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d
}

export const invitationService = {
    async sendInvite({
        workspaceId,
        email,
        role,
        actorId,
    }: {
        workspaceId: string
        email: string
        role: Role
        actorId: string
    }) {
        const membership = await authorizationService.ensureMembership(actorId, workspaceId)
        authorizationService.ensurePermission(membership, Permission.INVITE_USERS)

        const normalizedEmail = email.trim().toLowerCase()

        const existing = await invitationRepository.findActivePendingByEmail(workspaceId, normalizedEmail)
        if (existing) throw new ForbiddenError("Pending invitation already exists")

        const token = generateToken()

        return runWorkspaceMutation(async (db) => {
            return invitationRepository.create({
                workspaceId,
                email: normalizedEmail,
                role,
                token,
                expiresAt: expiresInDays(7),
                invitedBy: actorId,
            }, db)
        }, {
            event: (invite, db) => domainEventService.record({
                db,
                ...domainEvents.invitationSent({
                    workspaceId,
                    actorId,
                    invitationId: invite.id,
                    email: normalizedEmail,
                    role,
                }),
            }),
        })
    },

    async acceptInvite({
        token,
        userId,
    }: {
        token: string
        userId: string
    }) {
        const invite = await invitationRepository.findByToken(token)
        if (!invite) throw new NotFoundError("Invitation not found")

        if (invite.acceptedAt) throw new ForbiddenError("Invitation already accepted")

        if (invite.expiresAt < new Date()) throw new ForbiddenError("Invitation expired")

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
        })

        if (!user) throw new NotFoundError("User not found")

        if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
            throw new ForbiddenError("Invitation does not belong to this user")
        }

        const existingMembership = await prisma.membership.findUnique({
            where: {
                userId_workspaceId: {
                    userId,
                    workspaceId: invite.workspaceId,
                },
            },
        })

        if (existingMembership) {
            throw new ConflictError("User is already a member")
        }

        const membership = await membershipService.addMember({
            workspaceId: invite.workspaceId,
            userId,
            role: invite.role,
            actorId: invite.invitedBy,
        })

        await runWorkspaceMutation(async (db) => {
            return invitationRepository.markAccepted(invite.id, db)
        }, {
            event: (_acceptedInvite, db) => domainEventService.record({
                db,
                ...domainEvents.invitationAccepted({
                    workspaceId: invite.workspaceId,
                    actorId: userId,
                    invitationId: invite.id,
                }),
            }),
        })

        return membership
    },
}
