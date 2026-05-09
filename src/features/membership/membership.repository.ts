import { prisma } from "@/lib/prisma"
import { DB } from "@/lib/db"

export async function findMembership(
    userId: string,
    workspaceId: string,
    db: DB = prisma
) {
    return db.membership.findUnique({
        where: { userId_workspaceId: { userId, workspaceId } },
    })
}

export async function countWorkspaceOwners(workspaceId: string, db: DB = prisma) {
    return db.membership.count({
        where: { workspaceId, role: "OWNER" },
    })
}

export async function listWorkspaceMembers(workspaceId: string, db: DB = prisma) {
    return db.membership.findMany({
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
}

export const membershipRepository = {
    findMembership,
    countWorkspaceOwners,
    listWorkspaceMembers,
}
