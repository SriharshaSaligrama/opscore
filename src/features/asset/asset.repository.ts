import { DB } from "@/lib/db"
import { prisma } from "@/lib/prisma"
import { activeInWorkspace, caseInsensitiveName } from "@/lib/workspace-repository"

export const assetRepository = {
    findById(assetId: string, db: DB = prisma) {
        return db.asset.findUnique({
            where: { id: assetId },
        })
    },

    findByIdWithActiveWorkOrders(assetId: string, db: DB = prisma) {
        return db.asset.findUnique({
            where: { id: assetId },
            include: {
                workOrders: {
                    where: { isDeleted: false },
                    select: { id: true },
                },
            },
        })
    },

    findActiveByName(workspaceId: string, name: string, db: DB = prisma) {
        return db.asset.findFirst({
            where: {
                ...activeInWorkspace(workspaceId),
                name: caseInsensitiveName(name),
            },
        })
    },

    findActiveByNameExcluding(
        workspaceId: string,
        name: string,
        assetId: string,
        db: DB = prisma
    ) {
        return db.asset.findFirst({
            where: {
                ...activeInWorkspace(workspaceId),
                name: caseInsensitiveName(name),
                NOT: { id: assetId },
            },
        })
    },

    listActive(workspaceId: string, db: DB = prisma) {
        return db.asset.findMany({
            where: activeInWorkspace(workspaceId),
            orderBy: { createdAt: "asc" },
            include: { category: true },
        })
    },
}
