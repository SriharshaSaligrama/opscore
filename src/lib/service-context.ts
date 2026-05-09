import { authorizationService } from "@/features/authorization/authorization.service"
import { Permission } from "@/features/authorization/permissions"
import { Role } from "@prisma/client"
import { DB } from "@/lib/db"

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
    permission?: Permission,
    db?: DB
): Promise<ServiceContext> {

    const membership = await authorizationService.ensureMembership(
        userId,
        workspaceId,
        db
    )

    if (permission) {
        authorizationService.ensurePermission(membership, permission)
    }

    return { membership }
}
