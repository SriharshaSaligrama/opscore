import { prisma } from "@/lib/prisma"

export async function findMembership(
    userId: string,
    workspaceId: string
) {
    return prisma.membership.findUnique({
        where: { userId_workspaceId: { userId, workspaceId } },
    })
}

export async function countWorkspaceOwners(workspaceId: string) {
    return prisma.membership.count({
        where: { workspaceId, role: "OWNER" },
    })
}