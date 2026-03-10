import { describe, it, expect } from "vitest"
import { membershipService } from "@/features/membership/membership.service"
import { createUser } from "@/tests/factories/user.factory"
import { createWorkspaceForUser } from "@/tests/factories/workspace.factory"
import { prisma } from "@/lib/prisma"

describe("Membership — Add Member", () => {
    it("adds user to workspace", async () => {
        const owner = await createUser()
        const workspace = await createWorkspaceForUser(owner.id)

        const newUser = await createUser()

        const membership = await membershipService.addMember({
            workspaceId: workspace.id,
            userId: newUser.id,
            role: "TECHNICIAN",
            actorId: owner.id,
        })

        expect(membership.workspaceId).toBe(workspace.id)
        expect(membership.userId).toBe(newUser.id)
        expect(membership.role).toBe("TECHNICIAN")
    })

    it("prevents duplicate membership", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        await expect(
            membershipService.addMember({
                workspaceId: ws.id,
                userId: owner.id,
                role: "ADMIN",
                actorId: owner.id,
            })
        ).rejects.toThrow()
    })

    it("fails if user does not exist", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        await expect(
            membershipService.addMember({
                workspaceId: ws.id,
                userId: "non-existent-id",
                role: "TECHNICIAN",
                actorId: owner.id,
            })
        ).rejects.toThrow()
    })

    it("fails if workspace does not exist", async () => {
        const owner = await createUser()
        const user = await createUser()

        await createWorkspaceForUser(owner.id)

        await expect(
            membershipService.addMember({
                workspaceId: "invalid-workspace",
                userId: user.id,
                role: "TECHNICIAN",
                actorId: owner.id,
            })
        ).rejects.toThrow()
    })
})

describe("Membership — List Members", () => {
    it("lists all members in workspace", async () => {
        const owner = await createUser()
        const workspace = await createWorkspaceForUser(owner.id)

        const members = await membershipService.listMembers(workspace.id)

        expect(members.length).toBe(1)
        expect(members[0].user.id).toBe(owner.id)
    })

    it("returns empty list for workspace with no members", async () => {
        const ws = await prisma.workspace.create({
            data: { name: "Empty WS" }
        })

        const members = await membershipService.listMembers(ws.id)

        expect(members).toEqual([])
    })

    it("returns empty list for non-existent workspace", async () => {
        const members = await membershipService.listMembers("invalid-id")
        expect(members).toEqual([])
    })

    it("returns correct roles for members", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const user = await createUser()

        await membershipService.addMember({
            workspaceId: ws.id,
            userId: user.id,
            role: "TECHNICIAN",
            actorId: owner.id,
        })

        const members = await membershipService.listMembers(ws.id)

        const tech = members.find(m => m.userId === user.id)
        expect(tech?.role).toBe("TECHNICIAN")
    })

    it("does not include members from other workspaces", async () => {
        const ownerA = await createUser()
        const wsA = await createWorkspaceForUser(ownerA.id)

        const ownerB = await createUser()
        const wsB = await createWorkspaceForUser(ownerB.id)

        const members = await membershipService.listMembers(wsA.id)

        expect(members.length).toBe(1)
        expect(members[0].workspaceId).not.toBe(wsB.id)
        expect(members[0].workspaceId).toBe(wsA.id)
    })

    it("includes user details in list response", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const members = await membershipService.listMembers(ws.id)

        expect(members[0].user).toBeDefined()
        expect(members[0].user.email).toBeDefined()
    })
})

describe("Membership — Remove Member", () => {
    it("removes user from workspace", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const user = await createUser()

        await membershipService.addMember({
            workspaceId: ws.id,
            userId: user.id,
            role: "TECHNICIAN",
            actorId: owner.id,
        })

        await membershipService.removeMember({
            workspaceId: ws.id,
            userId: user.id,
            actorId: owner.id,
        })

        const members = await membershipService.listMembers(ws.id)

        expect(members.length).toBe(1)
        expect(members[0].userId).toBe(owner.id)
    })

    it("fails when removing non-existent member", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        await expect(
            membershipService.removeMember({
                workspaceId: ws.id,
                userId: "invalid-id",
                actorId: owner.id,
            })
        ).rejects.toThrow()
    })

    it("removing one member does not affect others", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const userA = await createUser()
        const userB = await createUser()

        await membershipService.addMember({ workspaceId: ws.id, userId: userA.id, role: "VIEWER", actorId: owner.id })
        await membershipService.addMember({ workspaceId: ws.id, userId: userB.id, role: "VIEWER", actorId: owner.id })

        await membershipService.removeMember({ workspaceId: ws.id, userId: userA.id, actorId: owner.id })

        const members = await membershipService.listMembers(ws.id)

        expect(members.some(m => m.userId === userA.id)).toBe(false)
        expect(members.some(m => m.userId === userB.id)).toBe(true)
    })

    it("fails when removing member from wrong workspace", async () => {
        const ownerA = await createUser()
        const wsA = await createWorkspaceForUser(ownerA.id)

        const ownerB = await createUser()
        const wsB = await createWorkspaceForUser(ownerB.id)

        await expect(
            membershipService.removeMember({
                workspaceId: wsB.id,
                userId: ownerA.id,
                actorId: ownerB.id,
            })
        ).rejects.toThrow()

        await expect(
            membershipService.removeMember({
                workspaceId: wsA.id,
                userId: ownerB.id,
                actorId: ownerA.id,
            })
        ).rejects.toThrow()
    })
})

describe("Membership — Change Member Role", () => {
    it("updates member role", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const user = await createUser()

        await membershipService.addMember({
            workspaceId: ws.id,
            userId: user.id,
            role: "VIEWER",
            actorId: owner.id,
        })

        const updated = await membershipService.changeMemberRole({
            workspaceId: ws.id,
            userId: user.id,
            role: "ADMIN",
            actorId: owner.id,
        })

        expect(updated.role).toBe("ADMIN")
    })

    it("fails when changing role of non-existent member", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        await expect(
            membershipService.changeMemberRole({
                workspaceId: ws.id,
                userId: "invalid-id",
                role: "ADMIN",
                actorId: owner.id,
            })
        ).rejects.toThrow()
    })

    it("changing role does not affect other members", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const userA = await createUser()
        const userB = await createUser()

        await membershipService.addMember({ workspaceId: ws.id, userId: userA.id, role: "VIEWER", actorId: owner.id })
        await membershipService.addMember({ workspaceId: ws.id, userId: userB.id, role: "VIEWER", actorId: owner.id })

        await membershipService.changeMemberRole({
            workspaceId: ws.id,
            userId: userA.id,
            role: "ADMIN",
            actorId: owner.id,
        })

        const members = await membershipService.listMembers(ws.id)

        const a = members.find(m => m.userId === userA.id)
        const b = members.find(m => m.userId === userB.id)

        expect(a?.role).toBe("ADMIN")
        expect(b?.role).toBe("VIEWER")
    })

    it("allows changing role to same value", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const user = await createUser()

        await membershipService.addMember({
            workspaceId: ws.id,
            userId: user.id,
            role: "VIEWER",
            actorId: owner.id,
        })

        const updated = await membershipService.changeMemberRole({
            workspaceId: ws.id,
            userId: user.id,
            role: "VIEWER",
            actorId: owner.id,
        })

        expect(updated.role).toBe("VIEWER")
    })

    it("fails when changing role in wrong workspace", async () => {
        const ownerA = await createUser()
        const wsA = await createWorkspaceForUser(ownerA.id)

        const ownerB = await createUser()
        const wsB = await createWorkspaceForUser(ownerB.id)

        await expect(
            membershipService.changeMemberRole({
                workspaceId: wsB.id,
                userId: ownerA.id,
                role: "ADMIN",
                actorId: ownerB.id,
            })
        ).rejects.toThrow()

        await expect(
            membershipService.changeMemberRole({
                workspaceId: wsA.id,
                userId: ownerB.id,
                role: "ADMIN",
                actorId: ownerA.id,
            })
        ).rejects.toThrow()
    }
    )
})

describe("Membership — Multi Owner & Hierarchy", () => {
    it("allows owner to promote admin to owner", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const admin = await createUser()
        await membershipService.addMember({ workspaceId: ws.id, userId: admin.id, role: "ADMIN", actorId: owner.id })

        const updated = await membershipService.changeMemberRole({
            workspaceId: ws.id,
            userId: admin.id,
            role: "OWNER",
            actorId: owner.id,
        })

        expect(updated.role).toBe("OWNER")
    })

    it("prevents removing the last owner", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        await expect(
            membershipService.removeMember({
                workspaceId: ws.id,
                userId: owner.id,
                actorId: owner.id,
            })
        ).rejects.toThrow()
    })

    it("prevents demoting the last owner", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        await expect(
            membershipService.changeMemberRole({
                workspaceId: ws.id,
                userId: owner.id,
                role: "ADMIN",
                actorId: owner.id,
            })
        ).rejects.toThrow()
    })

    it("allows removing an owner if multiple owners exist", async () => {
        const owner1 = await createUser()
        const ws = await createWorkspaceForUser(owner1.id)

        const owner2 = await createUser()
        await membershipService.addMember({ workspaceId: ws.id, userId: owner2.id, role: "OWNER", actorId: owner1.id })

        await membershipService.removeMember({
            workspaceId: ws.id,
            userId: owner1.id,
            actorId: owner2.id,
        })
    })

    it("prevents admin from removing owner", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const admin = await createUser()
        await membershipService.addMember({ workspaceId: ws.id, userId: admin.id, role: "ADMIN", actorId: owner.id })

        await expect(
            membershipService.removeMember({
                workspaceId: ws.id,
                userId: owner.id,
                actorId: admin.id,
            })
        ).rejects.toThrow()
    })

    it("prevents admin from promoting to owner or admin", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const admin = await createUser()
        await membershipService.addMember({ workspaceId: ws.id, userId: admin.id, role: "ADMIN", actorId: owner.id })

        const user = await createUser()
        await membershipService.addMember({ workspaceId: ws.id, userId: user.id, role: "VIEWER", actorId: admin.id })

        await expect(
            membershipService.changeMemberRole({
                workspaceId: ws.id,
                userId: user.id,
                role: "OWNER",
                actorId: admin.id,
            })
        ).rejects.toThrow()

        await expect(
            membershipService.changeMemberRole({
                workspaceId: ws.id,
                userId: user.id,
                role: "ADMIN",
                actorId: admin.id,
            })
        ).rejects.toThrow()
    })

    it("allows owner to demote admin", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const admin = await createUser()
        await membershipService.addMember({ workspaceId: ws.id, userId: admin.id, role: "ADMIN", actorId: owner.id })

        const updated = await membershipService.changeMemberRole({
            workspaceId: ws.id,
            userId: admin.id,
            role: "MANAGER",
            actorId: owner.id,
        })

        expect(updated.role).toBe("MANAGER")
    })
})

describe("Membership — Audit Logging", () => {
    it("records event when member is added", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const user = await createUser()

        await membershipService.addMember({
            workspaceId: ws.id,
            userId: user.id,
            role: "TECHNICIAN",
            actorId: owner.id,
        })

        const events = await prisma.domainEvent.findMany({
            where: { entityId: user.id },
        })

        expect(events.length).toBe(1)
        expect(events[0].type).toBe("MEMBER_ADDED")
    })

    it("records event when member is removed", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const user = await createUser()

        await membershipService.addMember({
            workspaceId: ws.id,
            userId: user.id,
            role: "VIEWER",
            actorId: owner.id,
        })

        await membershipService.removeMember({
            workspaceId: ws.id,
            userId: user.id,
            actorId: owner.id,
        })

        const events = await prisma.domainEvent.findMany({
            where: { entityId: user.id },
            orderBy: { createdAt: "asc" },
        })

        expect(events.length).toBe(2)
        expect(events[0].type).toBe("MEMBER_ADDED")
        expect(events[1].type).toBe("MEMBER_REMOVED")
    })

    it("records event when role is changed", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const user = await createUser()

        await membershipService.addMember({
            workspaceId: ws.id,
            userId: user.id,
            role: "VIEWER",
            actorId: owner.id,
        })

        await membershipService.changeMemberRole({
            workspaceId: ws.id,
            userId: user.id,
            role: "ADMIN",
            actorId: owner.id,
        })

        const events = await prisma.domainEvent.findMany({
            where: { entityId: user.id },
            orderBy: { createdAt: "asc" },
        })

        expect(events.length).toBe(2)
        expect(events[0].type).toBe("MEMBER_ADDED")
        expect(events[1].type).toBe("MEMBER_ROLE_CHANGED")
    })
})

describe("Membership — Self Protection Rules", () => {
    it("prevents user from removing themselves", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        await expect(
            membershipService.removeMember({
                workspaceId: ws.id,
                userId: owner.id,
                actorId: owner.id,
            })
        ).rejects.toThrow()
    })

    it("prevents user from changing their own role", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        await expect(
            membershipService.changeMemberRole({
                workspaceId: ws.id,
                userId: owner.id,
                role: "ADMIN",
                actorId: owner.id,
            })
        ).rejects.toThrow()
    })
})