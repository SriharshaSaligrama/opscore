import { Permission } from "@/features/authorization/permissions"
import { prisma } from "@/lib/prisma"
import { getServiceContext } from "@/lib/service-context"

export const assetCategoryService = {
    async createCategory({
        userId, workspaceId, name
    }: { userId: string, workspaceId: string, name: string }) {
        const ctx = await getServiceContext(
            userId,
            workspaceId,
            Permission.CREATE_CATEGORY
        )

        return prisma.assetCategory.create({
            data: {
                name,
                workspaceId: ctx.membership.workspaceId,
            }
        })
    },

    async listCategories({
        userId, workspaceId
    }: { userId: string, workspaceId: string }) {
        const ctx = await getServiceContext(userId, workspaceId)

        return prisma.assetCategory.findMany({
            where: { workspaceId: ctx.membership.workspaceId },
            orderBy: { createdAt: "asc" }
        })
    }
}