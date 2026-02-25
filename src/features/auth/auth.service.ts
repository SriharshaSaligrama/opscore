import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { ConflictError, UnauthorizedError } from "@/lib/errors"

type SafeUser = {
    id: string
    name: string
    email: string
}

type LoginResult = {
    type: "NO_WORKSPACE"
    user: SafeUser
    sessionId: string
} | {
    type: "SINGLE_WORKSPACE"
    user: SafeUser
    sessionId: string
    workspaceId: string
} | {
    type: "MULTIPLE_WORKSPACES"
    user: SafeUser
    sessionId: string
    workspaces: { id: string; name: string }[]
}

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

    async login(email: string, password: string): Promise<LoginResult> {
        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            throw new UnauthorizedError("Invalid credentials")
        }

        const isValid = await bcrypt.compare(password, user.passwordHash)

        if (!isValid) {
            throw new UnauthorizedError("Invalid credentials")
        }

        const memberships = await prisma.membership.findMany({
            where: { userId: user.id },
            include: { workspace: true }
        })

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        const session = await prisma.session.create({
            data: {
                userId: user.id,
                expiresAt,
                activeWorkspaceId: null
            }
        })

        const safeUser: SafeUser = {
            id: user.id,
            name: user.name,
            email: user.email
        }

        if (memberships.length === 0) {
            return {
                type: "NO_WORKSPACE",
                user: safeUser,
                sessionId: session.id
            }
        }

        if (memberships.length === 1) {
            await prisma.session.update({
                where: { id: session.id },
                data: {
                    activeWorkspaceId: memberships[0].workspaceId
                }
            })

            return {
                type: "SINGLE_WORKSPACE",
                user: safeUser,
                sessionId: session.id,
                workspaceId: memberships[0].workspaceId
            }
        }

        return {
            type: "MULTIPLE_WORKSPACES",
            user: safeUser,
            sessionId: session.id,
            workspaces: memberships.map(m => ({
                id: m.workspace.id,
                name: m.workspace.name
            }))
        }
    }
}