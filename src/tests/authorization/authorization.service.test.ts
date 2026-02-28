import { describe, it, expect } from "vitest"
import { AuthorizationService } from "@/features/authorization/authorization.service"
import { createWorkspace } from "../factories/workspace.factory"
import { createUser, createMembership } from "../factories/user.factory"
import { Permission } from "@/features/authorization/permissions"

describe("AuthorizationService", () => {
    describe("ensureMembership", () => {
        it("throws if user is not part of workspace", async () => {
            const workspace = await createWorkspace()
            const user = await createUser()

            await expect(
                AuthorizationService.ensureMembership(user.id, workspace.id)
            ).rejects.toThrow("Not part of workspace")
        })

        it("returns membership if user belongs to workspace", async () => {
            const workspace = await createWorkspace()
            const user = await createUser()

            await createMembership(user.id, workspace.id, "MANAGER")

            const membership = await AuthorizationService.ensureMembership(
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

            const membership = await AuthorizationService.ensureMembership(
                user.id,
                workspace.id
            )

            expect(() =>
                AuthorizationService.ensurePermission(
                    membership,
                    Permission.MANAGE_USERS
                )
            ).toThrow("Insufficient permission")
        })
    })
})