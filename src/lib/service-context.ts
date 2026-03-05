import { authorizationService } from "@/features/authorization/authorization.service"
import { Permission } from "@/features/authorization/permissions"
import { Role } from "@prisma/client"

export type ServiceContext = {
    membership: {
        userId: string
        workspaceId: string
        role: Role
    }
}

/**
 * Loads membership and optionally validates permission.
 */
export async function getServiceContext(
    userId: string,
    workspaceId: string,
    permission?: Permission
): Promise<ServiceContext> {

    const membership = await authorizationService.ensureMembership(
        userId,
        workspaceId
    )

    if (permission) {
        authorizationService.ensurePermission(membership, permission)
    }

    return { membership }
}