import { AssetCategory } from "@prisma/client"
import { DB } from "@/lib/db"
import { prisma } from "@/lib/prisma"
import { createWorkspaceRepository } from "@/lib/workspace-repository"

const base = createWorkspaceRepository<AssetCategory>(
    (db: DB) => db.assetCategory
)

export const assetCategoryRepository = {
    ...base,

    /** Find a category with any non-deleted assets (for archive guard). */
    findByIdWithActiveAssets(categoryId: string, db: DB = prisma) {
        return db.assetCategory.findUnique({
            where: { id: categoryId },
            include: {
                assets: {
                    where: { isDeleted: false },
                    select: { id: true },
                },
            },
        })
    },
}
