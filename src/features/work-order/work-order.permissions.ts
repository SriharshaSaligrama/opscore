import { Permission } from "@/features/authorization/permissions"

export const WorkOrderPermissions = {
    create: Permission.CREATE_WORK_ORDER,
    view: Permission.VIEW_WORK_ORDER,
    update: Permission.UPDATE_WORK_ORDER,
}