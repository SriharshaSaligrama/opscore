import { describe, expect, it } from "vitest";
import { createWorkspace } from "@/tests/factories/workspace.factory";
import { createMembership, createUser } from "@/tests/factories/user.factory";
import { Role } from "@prisma/client";
import { assetCategoryService } from "@/features/asset-category/asset-category.service";
import { assetService } from "@/features/asset/asset.service";

describe("assetService.createAsset", () => {
    it("should create an asset successfully", async () => {
        const workspace = await createWorkspace()
        const owner = await createUser()

        await createMembership(
            owner.id,
            workspace.id,
            Role.OWNER
        )

        const category = await assetCategoryService.createCategory({
            userId: owner.id,
            workspaceId: workspace.id,
            name: "Electrical",
        })

        const asset = await assetService.createAsset({
            userId: owner.id,
            workspaceId: workspace.id,
            name: "Generator",
            categoryId: category.id
        })

        expect(asset).toHaveProperty("id")
        expect(asset.name).toBe("Generator")
        expect(asset.status).toBe("ACTIVE")
        expect(asset.categoryId).toBe(category.id)
        expect(asset.workspaceId).toBe(workspace.id)
        expect(asset.createdBy).toBe(owner.id)
    })

    it("rejects if category belongs to another workspace", async () => {
        const workspaceA = await createWorkspace()
        const workspaceB = await createWorkspace()
        const user = await createUser()

        await createMembership(user.id, workspaceA.id, Role.OWNER)
        await createMembership(user.id, workspaceB.id, Role.OWNER)

        const categoryB = await assetCategoryService.createCategory({
            userId: user.id,
            workspaceId: workspaceB.id,
            name: "Electrical",
        })

        await expect(assetService.createAsset({
            userId: user.id,
            workspaceId: workspaceA.id,
            name: "Generator",
            categoryId: categoryB.id
        })).rejects.toThrow("Category does not belong to workspace")
    })

    it("rejects if user lacks CREATE_ASSET permission", async () => {
        const workspace = await createWorkspace()
        const owner = await createUser()
        const viewer = await createUser()

        await createMembership(owner.id, workspace.id, Role.OWNER)
        await createMembership(viewer.id, workspace.id, Role.VIEWER)

        const category = await assetCategoryService.createCategory({
            userId: owner.id,
            workspaceId: workspace.id,
            name: "Electrical",
        })

        await expect(assetService.createAsset({
            userId: viewer.id,
            workspaceId: workspace.id,
            name: "Generator",
            categoryId: category.id
        })).rejects.toThrow()
    })

    it("rejects if category does not exist", async () => {
        const workspace = await createWorkspace()
        const owner = await createUser()

        await createMembership(owner.id, workspace.id, Role.OWNER)

        await expect(assetService.createAsset({
            userId: owner.id,
            workspaceId: workspace.id,
            name: "Generator",
            categoryId: "non-existent-category-id"
        })).rejects.toThrow("Category not found")
    })

    it("rejects if user is not a member of workspace", async () => {
        const workspace = await createWorkspace()
        const user = await createUser()

        await expect(assetService.createAsset({
            userId: user.id,
            workspaceId: workspace.id,
            name: "Generator",
            categoryId: "some-category-id"
        })).rejects.toThrow()
    })
})