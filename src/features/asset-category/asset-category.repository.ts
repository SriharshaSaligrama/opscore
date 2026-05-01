import { DB } from "@/lib/db"
import { prisma } from "@/lib/prisma"
import { activeInWorkspace, caseInsensitiveName } from "@/lib/workspace-repository"

export const assetCategoryRepository = {
    findById(categoryId: string, db: DB = prisma) {
        return db.assetCategory.findUnique({
            where: { id: categoryId },
        })
    },

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

    findActiveByName(workspaceId: string, name: string, db: DB = prisma) {
        return db.assetCategory.findFirst({
            where: {
                ...activeInWorkspace(workspaceId),
                name: caseInsensitiveName(name),
            },
        })
    },

    findActiveByNameExcluding(
        workspaceId: string,
        name: string,
        categoryId: string,
        db: DB = prisma
    ) {
        return db.assetCategory.findFirst({
            where: {
                ...activeInWorkspace(workspaceId),
                name: caseInsensitiveName(name),
                NOT: { id: categoryId },
            },
        })
    },

    listActive(workspaceId: string, db: DB = prisma) {
        return db.assetCategory.findMany({
            where: activeInWorkspace(workspaceId),
            orderBy: { createdAt: "asc" },
        })
    },
}
