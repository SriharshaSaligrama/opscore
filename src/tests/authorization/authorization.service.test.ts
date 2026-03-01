import { describe, it, expect } from "vitest"
import { authorizationService } from "@/features/authorization/authorization.service"
import { createWorkspace } from "@/tests/factories/workspace.factory"
import { createUser, createMembership } from "@/tests/factories/user.factory"
import { Permission } from "@/features/authorization/permissions"

describe("authorizationService", () => {
    describe("ensureMembership", () => {
        it("throws if user is not part of workspace", async () => {
            const workspace = await createWorkspace()
            const user = await createUser()

            await expect(
                authorizationService.ensureMembership(user.id, workspace.id)
            ).rejects.toThrow("Not part of workspace")
        })

        it("returns membership if user belongs to workspace", async () => {
            const workspace = await createWorkspace()
            const user = await createUser()

            await createMembership(user.id, workspace.id, "MANAGER")

            const membership = await authorizationService.ensureMembership(
                user.id,
                workspace.id
            )

            expect(membership.role).toBe("MANAGER")
        })
    })

    describe("ensurePermission", () => {
        it("throws if role does not have permission", async () => {
            const workspace = await createWorkspace()
            const user = await createUser()

            await createMembership(user.id, workspace.id, "VIEWER")

            const membership = await authorizationService.ensureMembership(
                user.id,
                workspace.id
            )

            expect(() =>
                authorizationService.ensurePermission(
                    membership,
                    Permission.MANAGE_USERS
                )
            ).toThrow("Insufficient permission")
        })
    })
})