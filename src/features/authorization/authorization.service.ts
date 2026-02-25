import { ForbiddenError } from "@/lib/errors"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { Permission, RolePermissions } from "./permissions"

export class AuthorizationService {
    static async ensureMembership(
        userId: string,
        workspaceId: string
    ) {
        const membership = await prisma.membership.findUnique({
            where: {
                userId_workspaceId: {
                    userId,
                    workspaceId
                }
            }
        })

        if (!membership) {
            throw new ForbiddenError("Not part of workspace")
        }

        return {
            userId: membership.userId,
            workspaceId: membership.workspaceId,
            role: membership.role
        }
    }

    static ensureRole(
        membership: { role: Role },
        allowedRoles: Role[]
    ) {
        if (!allowedRoles.includes(membership.role)) {
            throw new ForbiddenError("Insufficient permissions")
        }
    }

    static ensurePermission(
        membership: { role: Role },
        permission: Permission
    ) {
        const allowed = RolePermissions[membership.role]?.includes(permission)

        if (!allowed) {
            throw new ForbiddenError("Insufficient permission")
        }
    }
}