export enum Permission {
    // Workspace Permissions
    MANAGE_WORKSPACE = "MANAGE_WORKSPACE",

    // Asset Permissions
    VIEW_ASSET = "VIEW_ASSET",
    CREATE_ASSET = "CREATE_ASSET",
    UPDATE_ASSET = "UPDATE_ASSET",
    ARCHIVE_ASSET = "ARCHIVE_ASSET",

    // Category Permissions
    CREATE_CATEGORY = "CREATE_CATEGORY",
    VIEW_CATEGORY = "VIEW_CATEGORY",
    ARCHIVE_CATEGORY = "ARCHIVE_CATEGORY",

    // Work Order Permissions
    VIEW_WORK_ORDER = "VIEW_WORK_ORDER",
    CREATE_WORK_ORDER = "CREATE_WORK_ORDER",
    UPDATE_WORK_ORDER = "UPDATE_WORK_ORDER",

    // Membership Permissions
    MANAGE_USERS = "MANAGE_USERS", // change roles
    INVITE_USERS = "INVITE_USERS", // add member
    REMOVE_USERS = "REMOVE_USERS", // remove member
}

import { Role } from "@prisma/client"

export const RolePermissions: Record<Role, Permission[]> = {
    OWNER: [
        Permission.MANAGE_WORKSPACE,
        Permission.VIEW_ASSET,
        Permission.CREATE_ASSET,
        Permission.UPDATE_ASSET,
        Permission.ARCHIVE_ASSET,
        Permission.VIEW_CATEGORY,
        Permission.CREATE_CATEGORY,
        Permission.ARCHIVE_CATEGORY,
        Permission.VIEW_WORK_ORDER,
        Permission.CREATE_WORK_ORDER,
        Permission.UPDATE_WORK_ORDER,
        Permission.MANAGE_USERS,
        Permission.INVITE_USERS,
        Permission.REMOVE_USERS,
    ],

    ADMIN: [
        Permission.MANAGE_WORKSPACE,
        Permission.VIEW_ASSET,
        Permission.CREATE_ASSET,
        Permission.UPDATE_ASSET,
        Permission.ARCHIVE_ASSET,
        Permission.VIEW_CATEGORY,
        Permission.CREATE_CATEGORY,
        Permission.ARCHIVE_CATEGORY,
        Permission.VIEW_WORK_ORDER,
        Permission.CREATE_WORK_ORDER,
        Permission.UPDATE_WORK_ORDER,
        Permission.INVITE_USERS,
    ],

    MANAGER: [
        Permission.VIEW_CATEGORY,
        Permission.CREATE_CATEGORY,
        Permission.VIEW_ASSET,
        Permission.VIEW_WORK_ORDER,
        Permission.CREATE_WORK_ORDER,
        Permission.UPDATE_WORK_ORDER,
    ],

    TECHNICIAN: [
        Permission.VIEW_CATEGORY,
        Permission.VIEW_ASSET,
        Permission.VIEW_WORK_ORDER,
        Permission.UPDATE_WORK_ORDER,
    ],

    VIEWER: [
        Permission.VIEW_ASSET,
        Permission.VIEW_CATEGORY,
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