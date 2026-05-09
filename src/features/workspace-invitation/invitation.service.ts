import crypto from "crypto"
import { Role } from "@prisma/client"
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors"

import { invitationRepository } from "./invitation.repository"
import { authorizationService } from "@/features/authorization/authorization.service"
import { Permission } from "@/features/authorization/permissions"

import { domainEvents } from "@/features/domain-events/domain-event.builders"
import { runWorkspaceMutation } from "@/lib/service-mutation"
import { authRepository } from "@/features/auth/auth.repository"
import { membershipRepository } from "@/features/membership/membership.repository"

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
            event: (invite) => domainEvents.invitationSent({
                    workspaceId,
                    actorId,
                    invitationId: invite.id,
                    email: normalizedEmail,
                    role,
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
        return runWorkspaceMutation(async (db) => {
            const invite = await invitationRepository.findByToken(token, db)
            if (!invite) throw new NotFoundError("Invitation not found")

            if (invite.acceptedAt) throw new ForbiddenError("Invitation already accepted")

            if (invite.expiresAt < new Date()) throw new ForbiddenError("Invitation expired")

            const user = await authRepository.findUserEmailById(userId, db)

            if (!user) throw new NotFoundError("User not found")

            if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
                throw new ForbiddenError("Invitation does not belong to this user")
            }

            const existingMembership = await membershipRepository.findMembership(
                userId,
                invite.workspaceId,
                db
            )

            if (existingMembership) {
                throw new ConflictError("User is already a member")
            }

            const membership = await db.membership.create({
                data: {
                    workspaceId: invite.workspaceId,
                    userId,
                    role: invite.role,
                },
            })

            await invitationRepository.markAccepted(invite.id, db)

            return { membership, invite }
        }, {
            uniqueConflictMessage: "User is already a member",
            event: ({ invite }) => [
                domainEvents.memberAdded({
                    workspaceId: invite.workspaceId,
                    actorId: invite.invitedBy,
                    userId,
                    role: invite.role,
                    source: "invitation",
                }),
                domainEvents.invitationAccepted({
                    workspaceId: invite.workspaceId,
                    actorId: userId,
                    invitationId: invite.id,
                }),
            ],
        }).then(({ membership }) => membership)
    },
}
