import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export const invitationRepository = {
    findByToken(token: string) {
        return prisma.workspaceInvitation.findUnique({
            where: { token },
        })
    },

    findActivePendingByEmail(workspaceId: string, email: string) {
        return prisma.workspaceInvitation.findFirst({
            where: {
                workspaceId,
                email: email.toLowerCase(),
                acceptedAt: null,
                expiresAt: { gt: new Date() },
            },
        })
    },

    create(data: {
        workspaceId: string
        email: string
        role: Role
        token: string
        expiresAt: Date
        invitedBy: string
    }) {
        return prisma.workspaceInvitation.create({ data })
    },

    markAccepted(id: string) {
        return prisma.workspaceInvitation.update({
            where: { id },
            data: { acceptedAt: new Date() },
        })
    },
}
