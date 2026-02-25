export enum Permission {
    VIEW_ASSET = "VIEW_ASSET",
    CREATE_ASSET = "CREATE_ASSET",
    UPDATE_ASSET = "UPDATE_ASSET",
    DELETE_ASSET = "DELETE_ASSET",

    VIEW_WORK_ORDER = "VIEW_WORK_ORDER",
    CREATE_WORK_ORDER = "CREATE_WORK_ORDER",
    UPDATE_WORK_ORDER = "UPDATE_WORK_ORDER",

    MANAGE_USERS = "MANAGE_USERS", // change roles
    INVITE_USERS = "INVITE_USERS", // add member
    REMOVE_USERS = "REMOVE_USERS", // remove member
}

import { Role } from "@prisma/client"

export const RolePermissions: Record<Role, Permission[]> = {
    OWNER: [
        Permission.VIEW_ASSET,
        Permission.CREATE_ASSET,
        Permission.UPDATE_ASSET,
        Permission.DELETE_ASSET,
        Permission.VIEW_WORK_ORDER,
        Permission.CREATE_WORK_ORDER,
        Permission.UPDATE_WORK_ORDER,
        Permission.MANAGE_USERS,
        Permission.INVITE_USERS,
        Permission.REMOVE_USERS,
    ],

    ADMIN: [
        Permission.VIEW_ASSET,
        Permission.CREATE_ASSET,
        Permission.UPDATE_ASSET,
        Permission.DELETE_ASSET,
        Permission.VIEW_WORK_ORDER,
        Permission.CREATE_WORK_ORDER,
        Permission.UPDATE_WORK_ORDER,
        Permission.INVITE_USERS,
    ],

    MANAGER: [
        Permission.VIEW_ASSET,
        Permission.VIEW_WORK_ORDER,
        Permission.CREATE_WORK_ORDER,
        Permission.UPDATE_WORK_ORDER,
    ],

    TECHNICIAN: [
        Permission.VIEW_WORK_ORDER,
        Permission.UPDATE_WORK_ORDER,
    ],

    VIEWER: [
        Permission.VIEW_ASSET,
        Permission.VIEW_WORK_ORDER,
    ],
}

export const RoleHierarchy: Record<Role, number> = {
    OWNER: 5,
    ADMIN: 4,
    MANAGER: 3,
    TECHNICIAN: 2,
    VIEWER: 1,
}

// if (RoleHierarchy[targetRole] >= RoleHierarchy[actorRole]) {
//     throw new ForbiddenError("Cannot modify equal or higher role")
// }