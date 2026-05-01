import { Role } from "@prisma/client"
import { Permission, RolePermissions } from "@/features/authorization/permissions"

export function can(role: Role | null | undefined, permission: Permission) {
    if (!role) return false

    return RolePermissions[role]?.includes(permission) ?? false
}

export function getWorkspaceCapabilities(role: Role | null | undefined) {
    return {
        canCreateWorkspace: can(role, Permission.CREATE_WORKSPACE),
        canManageWorkspace: can(role, Permission.MANAGE_WORKSPACE),
        canCreateAsset: can(role, Permission.CREATE_ASSET),
        canUpdateAsset: can(role, Permission.UPDATE_ASSET),
        canArchiveAsset: can(role, Permission.ARCHIVE_ASSET),
        canCreateCategory: can(role, Permission.CREATE_CATEGORY),
        canUpdateCategory: can(role, Permission.UPDATE_CATEGORY),
        canArchiveCategory: can(role, Permission.ARCHIVE_CATEGORY),
        canCreateWorkOrder: can(role, Permission.CREATE_WORK_ORDER),
        canUpdateWorkOrder: can(role, Permission.UPDATE_WORK_ORDER),
        canInviteUsers: can(role, Permission.INVITE_USERS),
        canManageUsers: can(role, Permission.MANAGE_USERS),
        canRemoveUsers: can(role, Permission.REMOVE_USERS),
    }
}
