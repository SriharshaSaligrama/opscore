import { ForbiddenError } from "@/lib/errors"
import { Role } from "@prisma/client"
import { Permission, RoleHierarchy, RolePermissions } from "./permissions"
import { findMembership } from "@/features/membership/membership.repository"

export const authorizationService = {
    async ensureMembership(userId: string, workspaceId: string) {
        const membership = await findMembership(userId, workspaceId)

        if (!membership) {
            throw new ForbiddenError("Not part of workspace")
        }

        return {
            userId: membership.userId,
            workspaceId: membership.workspaceId,
            role: membership.role
        }
    },

    ensureRole(membership: { role: Role }, allowedRoles: Role[]) {
        if (!allowedRoles.includes(membership.role)) {
            throw new ForbiddenError("Insufficient permissions")
        }
    },

    ensurePermission(membership: { role: Role }, permission: Permission) {
        const allowed = RolePermissions[membership.role]?.includes(permission)

        if (!allowed) {
            throw new ForbiddenError("Insufficient permission")
        }
    },

    ensureCanManageRole(actorRole: Role, targetRole: Role) {
        const actorRank = RoleHierarchy[actorRole]
        const targetRank = RoleHierarchy[targetRole]

        // Allow OWNER to manage OWNER (multi-owner rule)
        if (actorRole === "OWNER" && targetRole === "OWNER") {
            return
        }

        if (actorRank <= targetRank) {
            throw new ForbiddenError("Cannot manage equal or higher role")
        }
    }
}