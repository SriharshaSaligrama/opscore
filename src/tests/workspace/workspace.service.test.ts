import { describe, it, expect } from "vitest"
import { prisma } from "@/lib/prisma"
import { workspaceService } from "@/features/workspace/workspace.service"
import { createWorkspace } from "@/tests/factories/workspace.factory"
import { createUser, createMembership } from "@/tests/factories/user.factory"
import { ForbiddenError, NotFoundError } from "@/lib/errors"

describe("workspaceService.selectWorkspace", () => {
    it("sets activeWorkspaceId if user is member", async () => {
        const workspace = await createWorkspace()
        const user = await createUser()

        await createMembership(user.id, workspace.id, "OWNER")

        const session = await prisma.session.create({
            data: {
                userId: user.id,
                expiresAt: new Date(Date.now() + 1000000),
                activeWorkspaceId: null
            }
        })

        const result = await workspaceService.selectWorkspace(
            session.id,
            workspace.id
        )

        expect(result.workspaceId).toBe(workspace.id)

        const updated = await prisma.session.findUnique({
            where: { id: session.id }
        })

        expect(updated?.activeWorkspaceId).toBe(workspace.id)
    })

    it("throws if user is not a member", async () => {
        const workspace = await createWorkspace()
        const user = await createUser()

        const session = await prisma.session.create({
            data: {
                userId: user.id,
                expiresAt: new Date(Date.now() + 1000000),
                activeWorkspaceId: null
            }
        })

        await expect(
            workspaceService.selectWorkspace(session.id, workspace.id)
        ).rejects.toThrow(ForbiddenError)
    })
})

describe("workspaceService.getUserWorkspaces", () => {
    it("returns all workspaces for user", async () => {
        const w1 = await createWorkspace("W1")
        const w2 = await createWorkspace("W2")
        const user = await createUser()

        await createMembership(user.id, w1.id, "OWNER")
        await createMembership(user.id, w2.id, "OWNER")

        const session = await prisma.session.create({
            data: {
                userId: user.id,
                expiresAt: new Date(Date.now() + 1000000),
                activeWorkspaceId: null
            }
        })

        const result = await workspaceService.getUserWorkspaces(session.id)

        expect(result.length).toBe(2)
    })
})

describe("workspaceService.validateWorkspaceAccess", () => {
    it("returns true if user is member", async () => {
        const workspace = await createWorkspace()
        const user = await createUser()

        await createMembership(user.id, workspace.id, "OWNER")

        const result = await workspaceService.validateWorkspaceAccess(
            user.id,
            workspace.id
        )

        expect(result).toBe(true)
    })

    it("returns false if user not member", async () => {
        const workspace = await createWorkspace()
        const user = await createUser()

        const result = await workspaceService.validateWorkspaceAccess(
            user.id,
            workspace.id
        )

        expect(result).toBe(false)
    })
})

describe("workspaceService.getActiveWorkSpaceDetails", () => {
    it("returns workspace details", async () => {
        const workspace = await createWorkspace("Test WS")

        const result = await workspaceService.getActiveWorkSpaceDetails(workspace.id)

        expect(result.name).toBe("Test WS")
    })

    it("throws if workspace not found", async () => {
        await expect(
            workspaceService.getActiveWorkSpaceDetails("invalid-id")
        ).rejects.toThrow(NotFoundError)
    })
})