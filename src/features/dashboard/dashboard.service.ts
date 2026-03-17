import { prisma } from "@/lib/prisma"

export async function getWorkOrderCount(workspaceId: string) {
    return prisma.workOrder.count({ where: { workspaceId } })
}

export async function getAssetCount(workspaceId: string) {
    return prisma.asset.count({ where: { workspaceId } })
}

export async function getMemberCount(workspaceId: string) {
    return prisma.membership.count({ where: { workspaceId } })
}