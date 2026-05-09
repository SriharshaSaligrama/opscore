import { DB } from "@/lib/db"
import { prisma } from "@/lib/prisma"

export const dashboardRepository = {
    countActiveWorkOrders(workspaceId: string, db: DB = prisma) {
        return db.workOrder.count({ where: { workspaceId, isDeleted: false } })
    },

    countActiveAssets(workspaceId: string, db: DB = prisma) {
        return db.asset.count({ where: { workspaceId, isDeleted: false } })
    },

    countMembers(workspaceId: string, db: DB = prisma) {
        return db.membership.count({ where: { workspaceId } })
    },
}
