import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import bcrypt from "bcrypt"

export async function createUser(
    email?: string,
    password = "password",
    name = "Test User"
) {
    const uniqueEmail =
        email ?? `user-${crypto.randomUUID()}@test.com`

    const passwordHash = await bcrypt.hash(password, 10)

    return prisma.user.create({
        data: {
            email: uniqueEmail,
            passwordHash,
            name,
        },
    })
}

export async function createMembership(
    userId: string,
    workspaceId: string,
    role: Role
) {
    return prisma.membership.create({
        data: {
            userId,
            workspaceId,
            role,
        },
    })
}