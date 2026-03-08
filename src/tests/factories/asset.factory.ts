import { prisma } from "@/lib/prisma"

export async function createAssetForWorkspace({
    userId,
    workspaceId,
    categoryName = "Test Category",
    assetName = "Test Asset",
}: {
    userId: string
    workspaceId: string
    categoryName?: string
    assetName?: string
}) {
    const category = await prisma.assetCategory.create({
        data: {
            name: categoryName,
            workspaceId,
        },
    })

    return prisma.asset.create({
        data: {
            name: assetName,
            workspaceId,
            categoryId: category.id,
            createdBy: userId,
        },
    })
}