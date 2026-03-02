import { prisma } from "@/lib/prisma"
import { authorizationService } from "../authorization/authorization.service"
import { Permission } from "../authorization/permissions"
import { ForbiddenError, NotFoundError } from "@/lib/errors"
import { AssetStatus } from "@prisma/client"

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

    async listAssets({
        userId, workspaceId
    }: { userId: string, workspaceId: string }) {
        await authorizationService.ensureMembership(
            userId,
            workspaceId
        )

        return prisma.asset.findMany({
            where: { workspaceId, isDeleted: false },
            orderBy: { createdAt: "asc" }
        })
    },

    async updateAsset({
        userId, workspaceId, assetId, name, categoryId, status
    }: { userId: string, workspaceId: string, assetId: string, name?: string, categoryId?: string, status?: AssetStatus }) {
        const membership = await authorizationService.ensureMembership(
            userId,
            workspaceId
        )

        authorizationService.ensurePermission(
            membership,
            Permission.UPDATE_ASSET
        )

        const asset = await prisma.asset.findUnique({
            where: { id: assetId }
        })

        if (!asset) {
            throw new NotFoundError("Asset not found")
        }

        if (asset.workspaceId !== workspaceId) {
            throw new ForbiddenError("Asset does not belong to workspace")
        }

        if (asset.isDeleted) {
            throw new ForbiddenError("Cannot update archived asset")
        }

        if (categoryId != null) {
            const category = await prisma.assetCategory.findUnique({
                where: { id: categoryId }
            })

            if (!category) {
                throw new NotFoundError("Category not found")
            }

            if (category.workspaceId !== workspaceId) {
                throw new ForbiddenError("Category does not belong to workspace")
            }
        }

        return prisma.asset.update({
            where: { id: assetId },
            data: {
                ...(name != null && { name }),
                ...(status != null && { status }),
                ...(categoryId != null && { categoryId }),
            }
        })
    },

    async archiveAsset({
        userId, workspaceId, assetId
    }: { userId: string, workspaceId: string, assetId: string }) {
        const membership = await authorizationService.ensureMembership(
            userId,
            workspaceId
        )

        authorizationService.ensurePermission(
            membership,
            Permission.ARCHIVE_ASSET
        )

        const asset = await prisma.asset.findUnique({
            where: { id: assetId }
        })

        if (!asset) {
            throw new NotFoundError("Asset not found")
        }

        if (asset.workspaceId !== workspaceId) {
            throw new ForbiddenError("Asset does not belong to workspace")
        }

        if (asset.isDeleted) {
            return asset
        }

        return prisma.asset.update({
            where: { id: assetId },
            data: { isDeleted: true }
        })
    }
}