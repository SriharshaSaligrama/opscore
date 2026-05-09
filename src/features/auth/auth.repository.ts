import { DB } from "@/lib/db"
import { prisma } from "@/lib/prisma"

export const authRepository = {
    findUserByEmail(email: string, db: DB = prisma) {
        return db.user.findUnique({
            where: { email },
        })
    },

    findUserEmailById(userId: string, db: DB = prisma) {
        return db.user.findUnique({
            where: { id: userId },
            select: { email: true },
        })
    },

    findSessionById(sessionId: string, db: DB = prisma) {
        return db.session.findUnique({
            where: { id: sessionId },
        })
    },

    createSession(data: {
        userId: string
        expiresAt: Date
        activeWorkspaceId?: string | null
    }, db: DB = prisma) {
        return db.session.create({
            data,
        })
    },

    setActiveWorkspace(sessionId: string, workspaceId: string | null, db: DB = prisma) {
        return db.session.update({
            where: { id: sessionId },
            data: { activeWorkspaceId: workspaceId },
        })
    },

    listUserMembershipWorkspaces(userId: string, db: DB = prisma) {
        return db.membership.findMany({
            where: { userId },
            include: { workspace: true },
        })
    },
}
