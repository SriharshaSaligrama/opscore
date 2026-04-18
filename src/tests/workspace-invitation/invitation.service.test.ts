import { describe, it, expect } from "vitest"
import { invitationService } from "@/features/workspace-invitation/invitation.service"
import { createUser } from "@/tests/factories/user.factory"
import { createWorkspaceForUser } from "@/tests/factories/workspace.factory"
import { prisma } from "@/lib/prisma"

describe("Workspace Invitation — Send Invite", () => {
    it("allows owner to send invite", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const invite = await invitationService.sendInvite({
            workspaceId: ws.id,
            email: "newuser@test.com",
            role: "TECHNICIAN",
            actorId: owner.id,
        })

        expect(invite.email).toBe("newuser@test.com")
        expect(invite.workspaceId).toBe(ws.id)
        expect(invite.token).toBeDefined()
    })

    it("prevents duplicate pending invites", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        await invitationService.sendInvite({
            workspaceId: ws.id,
            email: "dup@test.com",
            role: "VIEWER",
            actorId: owner.id,
        })

        await expect(
            invitationService.sendInvite({
                workspaceId: ws.id,
                email: "dup@test.com",
                role: "VIEWER",
                actorId: owner.id,
            })
        ).rejects.toThrow()
    })

    it("allows re-inviting after previous pending invite expires", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const firstInvite = await invitationService.sendInvite({
            workspaceId: ws.id,
            email: "expired@test.com",
            role: "VIEWER",
            actorId: owner.id,
        })

        await prisma.workspaceInvitation.update({
            where: { id: firstInvite.id },
            data: { expiresAt: new Date(Date.now() - 1000) },
        })

        const secondInvite = await invitationService.sendInvite({
            workspaceId: ws.id,
            email: "expired@test.com",
            role: "VIEWER",
            actorId: owner.id,
        })

        expect(secondInvite.id).not.toBe(firstInvite.id)
    })

    it("prevents unauthorized users from inviting", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const outsider = await createUser()

        await expect(
            invitationService.sendInvite({
                workspaceId: ws.id,
                email: "nope@test.com",
                role: "VIEWER",
                actorId: outsider.id,
            })
        ).rejects.toThrow()
    })
})

describe("Workspace Invitation — Accept Invite", () => {
    it("accepts valid invite and creates membership", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const user = await createUser()

        const invite = await invitationService.sendInvite({
            workspaceId: ws.id,
            email: user.email,
            role: "TECHNICIAN",
            actorId: owner.id,
        })

        const membership = await invitationService.acceptInvite({
            token: invite.token,
            userId: user.id,
        })

        expect(membership.workspaceId).toBe(ws.id)
        expect(membership.userId).toBe(user.id)
        expect(membership.role).toBe("TECHNICIAN")
    }, 10000)

    it("prevents accepting with invalid token", async () => {
        const user = await createUser()

        await expect(
            invitationService.acceptInvite({
                token: "invalid-token",
                userId: user.id,
            })
        ).rejects.toThrow()
    })

    it("prevents accepting already accepted invite", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)
        const user = await createUser()

        const invite = await invitationService.sendInvite({
            workspaceId: ws.id,
            email: user.email,
            role: "VIEWER",
            actorId: owner.id,
        })

        await invitationService.acceptInvite({
            token: invite.token,
            userId: user.id,
        })

        await expect(
            invitationService.acceptInvite({
                token: invite.token,
                userId: user.id,
            })
        ).rejects.toThrow()
    }, 10000)

    it("prevents accepting invite for a different email", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)
        const invitedUser = await createUser("invited@test.com")
        const otherUser = await createUser("other@test.com")

        const invite = await invitationService.sendInvite({
            workspaceId: ws.id,
            email: invitedUser.email,
            role: "VIEWER",
            actorId: owner.id,
        })

        await expect(
            invitationService.acceptInvite({
                token: invite.token,
                userId: otherUser.id,
            })
        ).rejects.toThrow("Invitation does not belong to this user")
    })

    it("prevents accepting invite when user is already a member", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)

        const invite = await invitationService.sendInvite({
            workspaceId: ws.id,
            email: owner.email,
            role: "VIEWER",
            actorId: owner.id,
        })

        await expect(
            invitationService.acceptInvite({
                token: invite.token,
                userId: owner.id,
            })
        ).rejects.toThrow("User is already a member")
    })

    it("prevents accepting expired invite", async () => {
        const owner = await createUser()
        const ws = await createWorkspaceForUser(owner.id)
        const user = await createUser()

        const invite = await invitationService.sendInvite({
            workspaceId: ws.id,
            email: user.email,
            role: "VIEWER",
            actorId: owner.id,
        })

        // Force expire invite
        await prisma.workspaceInvitation.update({
            where: { id: invite.id },
            data: { expiresAt: new Date(Date.now() - 1000) },
        })

        await expect(
            invitationService.acceptInvite({
                token: invite.token,
                userId: user.id,
            })
        ).rejects.toThrow()
    })
})
