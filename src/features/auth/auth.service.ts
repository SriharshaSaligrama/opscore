import bcrypt from "bcrypt"
import { Role } from "@prisma/client"
import { ConflictError, UnauthorizedError } from "@/lib/errors"
import { runWorkspaceMutation } from "@/lib/service-mutation"
import { domainEvents } from "@/features/domain-events/domain-event.builders"
import { authRepository } from "@/features/auth/auth.repository"

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
        const existingUser = await authRepository.findUserByEmail(email)

        if (existingUser) {
            throw new ConflictError("Email already exists")
        }

        const passwordHash = await bcrypt.hash(password, 10)

        return runWorkspaceMutation(async (db) => {
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
        }, {
            event: ({ user, workspace }) => [
                domainEvents.workspaceCreated({
                        workspaceId: workspace.id,
                        actorId: user.id,
                        name: workspace.name,
                        source: "signup",
                }),
                domainEvents.memberAdded({
                        workspaceId: workspace.id,
                        actorId: user.id,
                        userId: user.id,
                        role: Role.OWNER,
                        source: "signup",
                }),
            ],
        })
    },

    async login(email: string, password: string): Promise<LoginResult> {
        const user = await authRepository.findUserByEmail(email)

        if (!user) {
            throw new UnauthorizedError("Invalid credentials")
        }

        const isValid = await bcrypt.compare(password, user.passwordHash)

        if (!isValid) {
            throw new UnauthorizedError("Invalid credentials")
        }

        const memberships = await authRepository.listUserMembershipWorkspaces(user.id)

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        const session = await authRepository.createSession({
            userId: user.id,
            expiresAt,
            activeWorkspaceId: null,
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
            await authRepository.setActiveWorkspace(session.id, memberships[0].workspaceId)

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
        const session = await authRepository.findSessionById(sessionId)

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
