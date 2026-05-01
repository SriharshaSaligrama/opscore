import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { DB } from "@/lib/db"

export const invitationRepository = {
    findByToken(token: string, db: DB = prisma) {
        return db.workspaceInvitation.findUnique({
            where: { token },
        })
    },

    findActivePendingByEmail(workspaceId: string, email: string, db: DB = prisma) {
        return db.workspaceInvitation.findFirst({
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
    }, db: DB = prisma) {
        return db.workspaceInvitation.create({ data })
    },

    markAccepted(id: string, db: DB = prisma) {
        return db.workspaceInvitation.update({
            where: { id },
            data: { acceptedAt: new Date() },
        })
    },
}
