// auth.repository.ts
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client";

export const authRepository = {
    findUserByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } })
    },

    createUser(data: { name: string; email: string; passwordHash: string }) {
        return prisma.user.create({ data })
    },

    createSession(data: {
        userId: string
        expiresAt: Date
    }) {
        return prisma.session.create({ data })
    },

    createWorkspace(name: string) {
        return prisma.workspace.create({ data: { name } })
    },

    createMembership(data: {
        userId: string
        workspaceId: string
        role: Role
    }) {
        return prisma.membership.create({ data })
    },
}