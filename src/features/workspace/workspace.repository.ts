import { DB } from "@/lib/db"
import { prisma } from "@/lib/prisma"

export const workspaceRepository = {
    findById(workspaceId: string, db: DB = prisma) {
        return db.workspace.findUnique({
            where: { id: workspaceId },
        })
    },

    findByName(name: string, db: DB = prisma) {
        return db.workspace.findFirst({
            where: { name },
        })
    },

    findByNameExcluding(name: string, workspaceId: string, db: DB = prisma) {
        return db.workspace.findFirst({
            where: {
                name,
                NOT: { id: workspaceId },
            },
        })
    },

    findMembership(userId: string, workspaceId: string, db: DB = prisma) {
        return db.membership.findUnique({
            where: {
                userId_workspaceId: {
                    userId,
                    workspaceId,
                },
            },
            include: {
                workspace: true,
            },
        })
    },

    listMembershipWorkspaces(userId: string, db: DB = prisma) {
        return db.membership.findMany({
            where: { userId },
            include: { workspace: true },
        })
    },
}
