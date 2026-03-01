import { authorizationService } from "@/features/authorization/authorization.service"
import { Permission } from "@/features/authorization/permissions"
import { prisma } from "@/lib/prisma"

export const assetCategoryService = {
    async createCategory({
        userId, workspaceId, name
    }: { userId: string, workspaceId: string, name: string }) {
        const membership = await authorizationService.ensureMembership(
            userId,
            workspaceId
        )

        authorizationService.ensurePermission(
            membership,
            Permission.CREATE_CATEGORY
        )

        return prisma.assetCategory.create({
            data: {
                name,
                workspaceId
            }
        })
    },

    async listCategories({
        userId, workspaceId
    }: { userId: string, workspaceId: string }) {
        await authorizationService.ensureMembership(
            userId,
            workspaceId
        )

        return prisma.assetCategory.findMany({
            where: { workspaceId },
            orderBy: { createdAt: "asc" }
        })
    }
}