// // auth.service.ts
// import bcrypt from "bcrypt"
// import { authRepository } from "./auth.repository"

// export const authService = {
//     async signup(email: string, password: string) {
//         const existing = await authRepository.findUserByEmail(email)

//         if (existing) {
//             throw new Error("Email already exists")
//         }

//         const passwordHash = await bcrypt.hash(password, 10)

//         const user = await authRepository.createUser({
//             email,
//             passwordHash
//         })

//         const workspace = await authRepository.createWorkspace(
//             `${email}'s Workspace`
//         )

//         await authRepository.createMembership({
//             userId: user.id,
//             workspaceId: workspace.id,
//             role: "OWNER"
//         })

//         return { user, workspace }
//     }
// }

import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { authRepository } from "./auth.repository"
import { ConflictError, UnauthorizedError } from "@/lib/errors"

export const authService = {
    async signup(name: string, email: string, password: string) {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            throw new ConflictError("Email already exists")
        }

        const passwordHash = await bcrypt.hash(password, 10)

        return prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: { name, email, passwordHash }
            })

            const workspace = await tx.workspace.create({
                data: { name: `${name}'s Workspace` }
            })

            await tx.membership.create({
                data: {
                    userId: user.id,
                    workspaceId: workspace.id,
                    role: Role.OWNER
                }
            })

            return { user, workspace }
        })
    },

    async login(email: string, password: string) {
        const user = await authRepository.findUserByEmail(email)

        if (!user) {
            throw new UnauthorizedError("Invalid credentials")
        }

        const isValid = await bcrypt.compare(password, user.passwordHash)

        if (!isValid) {
            throw new UnauthorizedError("Invalid credentials")
        }

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // 7-day session

        const session = await authRepository.createSession({
            userId: user.id,
            expiresAt
        })

        return { user, session }
    }
}