import { Asset } from "@prisma/client"
import { DB } from "@/lib/db"
import { prisma } from "@/lib/prisma"
import { createWorkspaceRepository, activeInWorkspace } from "@/lib/workspace-repository"

const base = createWorkspaceRepository<Asset>(
    (db: DB) => db.asset
)

export const assetRepository = {
    ...base,

    /** List active assets with their category relation included. */
    listActive(workspaceId: string, db: DB = prisma) {
        return db.asset.findMany({
            where: activeInWorkspace(workspaceId),
            orderBy: { createdAt: "asc" },
            include: { category: true },
        })
    },

    /** Find an asset together with any non-deleted work orders (for archive guard). */
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
}
