import { describe, it, expect } from "vitest"
import { prisma } from "@/lib/prisma"
import { workspaceService } from "@/features/workspace/workspace.service"
import { membershipService } from "@/features/membership/membership.service"
import { createWorkspace, createWorkspaceForUser } from "@/tests/factories/workspace.factory"
import { createUser, createMembership } from "@/tests/factories/user.factory"
import { ForbiddenError, NotFoundError } from "@/lib/errors"
import { Role } from "@prisma/client"

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

describe("workspaceService.renameWorkspace", () => {
    it("allows owner to rename workspace", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const updated = await workspaceService.renameWorkspace({
            workspaceId: ws.id,
            name: "New Workspace Name",
            actorId: owner.id,
        })

        expect(updated.name).toBe("New Workspace Name")
    })

    it("allows admin to rename workspace", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const admin = await createUser()

        await membershipService.addMember({
            workspaceId: ws.id,
            userId: admin.id,
            role: Role.ADMIN,
            actorId: owner.id,
        })

        const updated = await workspaceService.renameWorkspace({
            workspaceId: ws.id,
            name: "Admin Renamed Workspace",
            actorId: admin.id,
        })

        expect(updated.name).toBe("Admin Renamed Workspace")
    })

    it("prevents non-admin roles from renaming workspace", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const technician = await createUser()

        await membershipService.addMember({
            workspaceId: ws.id,
            userId: technician.id,
            role: Role.TECHNICIAN,
            actorId: owner.id,
        })

        await expect(
            workspaceService.renameWorkspace({
                workspaceId: ws.id,
                name: "Illegal Rename",
                actorId: technician.id,
            })
        ).rejects.toThrow()
    })

    it("does nothing when renaming to the same name", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const result = await workspaceService.renameWorkspace({
            workspaceId: ws.id,
            name: ws.name,
            actorId: owner.id,
        })

        expect(result.name).toBe(ws.name)

        const events = await prisma.domainEvent.findMany({
            where: { entityId: ws.id },
        })

        expect(events.length).toBe(0)
    })

    it("fails when workspace does not exist", async () => {
        const user = await createUser()

        await expect(
            workspaceService.renameWorkspace({
                workspaceId: "invalid-workspace-id",
                name: "Should Fail",
                actorId: user.id,
            })
        ).rejects.toThrow()
    })

    it("fails when workspace name already exists", async () => {
        const owner = await createUser()
        const ws1 = await createWorkspaceForUser(owner.id, "Workspace 1")
        const ws2 = await createWorkspaceForUser(owner.id, "Workspace 2")

        await expect(
            workspaceService.renameWorkspace({
                workspaceId: ws2.id,
                name: ws1.name,
                actorId: owner.id,
            })
        ).rejects.toThrow()
    })

    it("trims whitespace from workspace name", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const updated = await workspaceService.renameWorkspace({
            workspaceId: ws.id,
            name: "   Trimmed Workspace   ",
            actorId: owner.id,
        })

        expect(updated.name).toBe("Trimmed Workspace")
    })

    it("prevents renaming workspace to empty name", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        await expect(
            workspaceService.renameWorkspace({
                workspaceId: ws.id,
                name: "   ",
                actorId: owner.id,
            })
        ).rejects.toThrow()
    })

    it("prevents workspace names longer than allowed limit", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const longName = "A".repeat(200)

        await expect(
            workspaceService.renameWorkspace({
                workspaceId: ws.id,
                name: longName,
                actorId: owner.id,
            })
        ).rejects.toThrow()
    })

    it("does not affect other workspaces in the system", async () => {
        const ownerA = await createUser()
        const wsA = await createWorkspaceForUser(ownerA.id)

        const ownerB = await createUser()
        const wsB = await createWorkspaceForUser(ownerB.id)

        await workspaceService.renameWorkspace({
            workspaceId: wsA.id,
            name: "Renamed Workspace",
            actorId: ownerA.id,
        })

        const other = await prisma.workspace.findUnique({
            where: { id: wsB.id },
        })

        expect(other?.name).toBe(wsB.name)
    })
})