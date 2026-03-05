import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { ConflictError, UnauthorizedError } from "@/lib/errors"
import { withTransaction } from "@/lib/transaction"

type SafeUser = {
    id: string
    name: string
    email: string
}

type BaseLoginResult = {
    user: SafeUser
    sessionId: string
}

type NoWorkspaceResult = BaseLoginResult & {
    type: "NO_WORKSPACE"
}

type SingleWorkspaceResult = BaseLoginResult & {
    type: "SINGLE_WORKSPACE"
    workspaceId: string
}

type MultipleWorkspacesResult = BaseLoginResult & {
    type: "MULTIPLE_WORKSPACES"
    workspaces: { id: string; name: string }[]
}

type LoginResult = NoWorkspaceResult | SingleWorkspaceResult | MultipleWorkspacesResult

export const authService = {
    async signup(name: string, email: string, password: string) {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            throw new ConflictError("Email already exists")
        }

        const passwordHash = await bcrypt.hash(password, 10)

        return withTransaction(async (db) => {
            const user = await db.user.create({
                data: { name, email, passwordHash }
            })

            const workspace = await db.workspace.create({
                data: { name: `${name}'s Workspace` }
            })

            await db.membership.create({
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
    },

    async validateSession(sessionId: string) {
        const session = await prisma.session.findUnique({
            where: { id: sessionId }
        })

        if (!session) {
            throw new UnauthorizedError("Session not found")
        }

        if (session.expiresAt < new Date()) {
            throw new UnauthorizedError("Session expired")
        }

        if (!session.userId) {
            throw new UnauthorizedError("Invalid session")
        }

        return session
    },
}