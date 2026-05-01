import { describe, it, expect } from "vitest"
import { prisma } from "@/lib/prisma"
import { authService } from "@/features/auth/auth.service"
import { createWorkspace } from "@/tests/factories/workspace.factory"
import { createUser, createMembership } from "@/tests/factories/user.factory"
import { UnauthorizedError, ConflictError } from "@/lib/errors"
import { DomainEntityType } from "@prisma/client"
import { DomainEventType } from "@/features/domain-events/domain-event.types"

describe("authService.signup", () => {
    it("creates user, workspace and owner membership", async () => {
        const result = await authService.signup(
            "John",
            "john@test.com",
            "password"
        )

        const user = await prisma.user.findUnique({
            where: { email: "john@test.com" }
        })

        expect(user).not.toBeNull()

        const membership = await prisma.membership.findFirst({
            where: { userId: user!.id }
        })

        expect(membership?.role).toBe("OWNER")
        expect(membership?.workspaceId).toBe(result.workspace.id)
    })

    it("records workspace created and member added domain events", async () => {
        const { user, workspace } = await authService.signup(
            "John",
            "events@test.com",
            "password"
        )

        const events = await prisma.domainEvent.findMany({
            where: { workspaceId: workspace.id },
            orderBy: { createdAt: "asc" },
        })

        expect(events).toHaveLength(2)

        expect(events[0]).toMatchObject({
            entityType: DomainEntityType.WORKSPACE,
            entityId: workspace.id,
            actorId: user.id,
            type: DomainEventType.WORKSPACE_CREATED,
            message: "Workspace created",
            metadata: {
                name: workspace.name,
                source: "signup",
            },
        })

        expect(events[1]).toMatchObject({
            entityType: DomainEntityType.MEMBERSHIP,
            entityId: user.id,
            actorId: user.id,
            type: DomainEventType.MEMBER_ADDED,
            message: "Workspace owner added",
            metadata: {
                role: "OWNER",
                source: "signup",
            },
        })
    })

    it("throws if email already exists", async () => {
        await authService.signup("John", "dup@test.com", "password")

        await expect(
            authService.signup("Jane", "dup@test.com", "password")
        ).rejects.toThrow(ConflictError)
    })
})

describe("authService.login", () => {
    it("throws if user does not exist", async () => {
        await expect(
            authService.login("nope@test.com", "password")
        ).rejects.toThrow(UnauthorizedError)
    })
    it("throws if password is incorrect", async () => {
        await authService.signup("John", "wrong@test.com", "password")

        await expect(
            authService.login("wrong@test.com", "badpass")
        ).rejects.toThrow(UnauthorizedError)
    })
    it("returns NO_WORKSPACE if user has no memberships", async () => {
        await createUser("nowork@test.com", "password")

        const result = await authService.login("nowork@test.com", "password")

        expect(result.type).toBe("NO_WORKSPACE")
        expect(result.sessionId).toBeDefined()
    })
    it("returns SINGLE_WORKSPACE and auto-sets activeWorkspaceId", async () => {
        const workspace = await createWorkspace()
        const user = await createUser("single@test.com", "password")

        await createMembership(user.id, workspace.id, "OWNER")

        const result = await authService.login("single@test.com", "password")

        expect(result.type).toBe("SINGLE_WORKSPACE")

        if (result.type !== "SINGLE_WORKSPACE") {
            throw new Error("Expected SINGLE_WORKSPACE")
        }

        expect(result.workspaceId).toBe(workspace.id)

        const session = await prisma.session.findUnique({
            where: { id: result.sessionId }
        })

        expect(session?.activeWorkspaceId).toBe(workspace.id)
    })
    it("returns MULTIPLE_WORKSPACES if user has more than one workspace", async () => {
        const w1 = await createWorkspace("W1")
        const w2 = await createWorkspace("W2")

        const user = await createUser("multi@test.com", "password")

        await createMembership(user.id, w1.id, "OWNER")
        await createMembership(user.id, w2.id, "OWNER")

        const result = await authService.login("multi@test.com", "password")

        expect(result.type).toBe("MULTIPLE_WORKSPACES")

        if (result.type !== "MULTIPLE_WORKSPACES") {
            throw new Error("Expected MULTIPLE_WORKSPACES")
        }

        expect(result.workspaces.length).toBe(2)

        const session = await prisma.session.findUnique({
            where: { id: result.sessionId }
        })

        expect(session?.activeWorkspaceId).toBeNull()
    })
})

describe("authService.validateSession", () => {
    it("throws if session not found", async () => {
        await expect(
            authService.validateSession("invalid-id")
        ).rejects.toThrow(UnauthorizedError)
    })

    it("throws if session expired", async () => {
        const user = await createUser()
        const session = await prisma.session.create({
            data: {
                userId: user.id,
                expiresAt: new Date(Date.now() - 1000),
                activeWorkspaceId: null
            }
        })

        await expect(
            authService.validateSession(session.id)
        ).rejects.toThrow(UnauthorizedError)
    })

    it("returns session if valid", async () => {
        const user = await createUser()
        const session = await prisma.session.create({
            data: {
                userId: user.id,
                expiresAt: new Date(Date.now() + 1000000),
                activeWorkspaceId: null
            }
        })

        const result = await authService.validateSession(session.id)

        expect(result.id).toBe(session.id)
    })
})
