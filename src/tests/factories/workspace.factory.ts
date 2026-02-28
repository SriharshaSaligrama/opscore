import { prisma } from "@/lib/prisma"

export async function createWorkspace(name = "Test Workspace") {
    return prisma.workspace.create({
        data: { name },
    })
}