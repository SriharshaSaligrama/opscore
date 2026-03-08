import { prisma } from "@/lib/prisma"
import { createMembership } from "./user.factory"
import { Role } from "@prisma/client"

export async function createWorkspace(name = "Test Workspace") {
    return prisma.workspace.create({
        data: { name },
    })
}

export async function createWorkspaceForUser(
    userId: string,
    name = "Test Workspace",
    role: Role = "OWNER"
) {
    const workspace = await prisma.workspace.create({
        data: { name }
    })

    await createMembership(userId, workspace.id, role)

    return workspace
}