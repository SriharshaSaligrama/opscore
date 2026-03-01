import { prisma } from "@/lib/prisma"
import { authorizationService } from "../authorization/authorization.service"
import { Permission } from "../authorization/permissions"
import { ForbiddenError, NotFoundError } from "@/lib/errors"

export const assetService = {
    async createAsset({
        userId, workspaceId, name, categoryId
    }: { userId: string, workspaceId: string, name: string, categoryId: string }) {
        const membership = await authorizationService.ensureMembership(
            userId,
            workspaceId
        )

        authorizationService.ensurePermission(
            membership,
            Permission.CREATE_ASSET
        )

        const category = await prisma.assetCategory.findUnique({
            where: { id: categoryId }
        })

        if (!category) {
            throw new NotFoundError("Category not found")
        }

        if (category.workspaceId !== workspaceId) {
            throw new ForbiddenError("Category does not belong to workspace")
        }

        return prisma.asset.create({
            data: {
                name,
                categoryId,
                workspaceId,
                createdBy: userId
            }
        })
    },
}