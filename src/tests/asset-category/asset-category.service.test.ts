import { describe, expect, it } from "vitest";
import { createMembership, createUser } from "@/tests/factories/user.factory";
import { createWorkspace } from "@/tests/factories/workspace.factory";
import { Role } from "@prisma/client";
import { assetCategoryService } from "@/features/asset-category/asset-category.service";
import { assetService } from "@/features/asset/asset.service";

describe("assetCategoryService.createCategory", () => {
    it("creates category successfully", async () => {
        const user = await createUser()
        const workspace = await createWorkspace()

        await createMembership(user.id, workspace.id, Role.OWNER)

        const category = await assetCategoryService.createCategory({
            userId: user.id,
            workspaceId: workspace.id,
            name: "Electrical",
        })

        expect(category.name).toBe("Electrical")
        expect(category.workspaceId).toBe(workspace.id)
    })

    it("allows manager to create category", async () => {
        const workspace = await createWorkspace()
        const manager = await createUser()

        await createMembership(manager.id, workspace.id, Role.MANAGER)

        const category = await assetCategoryService.createCategory({
            userId: manager.id,
            workspaceId: workspace.id,
            name: "Safety",
        })

        expect(category.name).toBe("Safety")
    })

    it("rejects duplicate category in same workspace", async () => {
        const user = await createUser()
        const workspace = await createWorkspace()

        await createMembership(user.id, workspace.id, Role.OWNER)

        await assetCategoryService.createCategory({
            userId: user.id,
            workspaceId: workspace.id,
            name: "Electrical",
        })

        await expect(
            assetCategoryService.createCategory({
                userId: user.id,
                workspaceId: workspace.id,
                name: "Electrical",
            })
        ).rejects.toThrow()
    })

    it("rejects insufficient permission (viewer)", async () => {
        const user = await createUser()
        const workspace = await createWorkspace()

        await createMembership(user.id, workspace.id, Role.VIEWER)

        await expect(
            assetCategoryService.createCategory({
                userId: user.id,
                workspaceId: workspace.id,
                name: "Electrical",
            })
        ).rejects.toThrow()
    })

    it("rejects user not in workspace", async () => {
        const user = await createUser()
        const workspace = await createWorkspace()

        // No membership created

        await expect(
            assetCategoryService.createCategory({
                userId: user.id,
                workspaceId: workspace.id,
                name: "Electrical",
            })
        ).rejects.toThrow()
    })
})

describe("assetCategoryService.listCategeories", () => {
    it("returns only categories from user's workspace", async () => {
        const userA = await createUser()
        const workspaceA = await createWorkspace()
        await createMembership(userA.id, workspaceA.id, Role.OWNER)

        const userB = await createUser()
        const workspaceB = await createWorkspace()
        await createMembership(userB.id, workspaceB.id, Role.OWNER)

        await assetCategoryService.createCategory({
            userId: userA.id,
            workspaceId: workspaceA.id,
            name: "Electrical",
        })

        await assetCategoryService.createCategory({
            userId: userB.id,
            workspaceId: workspaceB.id,
            name: "Plumbing",
        })

        const categories = await assetCategoryService.listCategories({
            userId: userA.id,
            workspaceId: workspaceA.id,
        })

        expect(categories).toHaveLength(1)
        expect(categories[0].name).toBe("Electrical")
    })

    it("lists all categories for any user of same workspace", async () => {
        const workspace = await createWorkspace()

        const userA = await createUser()
        const userB = await createUser()

        await createMembership(userA.id, workspace.id, Role.OWNER)
        await createMembership(userB.id, workspace.id, Role.MANAGER)

        await assetCategoryService.createCategory({
            userId: userA.id,
            workspaceId: workspace.id,
            name: "Electrical",
        })

        const categoriesForB = await assetCategoryService.listCategories({
            userId: userB.id,
            workspaceId: workspace.id,
        })

        expect(categoriesForB).toHaveLength(1)
        expect(categoriesForB[0].name).toBe("Electrical")
    })

    it("allows same category name in different workspaces", async () => {
        const workspaceA = await createWorkspace()
        const workspaceB = await createWorkspace()

        const userA = await createUser()
        const userB = await createUser()

        await createMembership(userA.id, workspaceA.id, Role.OWNER)
        await createMembership(userB.id, workspaceB.id, Role.OWNER)

        const categoryA = await assetCategoryService.createCategory({
            userId: userA.id,
            workspaceId: workspaceA.id,
            name: "Electrical",
        })

        const categoryB = await assetCategoryService.createCategory({
            userId: userB.id,
            workspaceId: workspaceB.id,
            name: "Electrical",
        })

        expect(categoryA.name).toBe("Electrical")
        expect(categoryB.name).toBe("Electrical")
    })

    it("rejects listing categories if user is not a member of workspace", async () => {
        const workspace = await createWorkspace()

        const member = await createUser()
        const outsider = await createUser()

        await createMembership(member.id, workspace.id, Role.OWNER)

        await assetCategoryService.createCategory({
            userId: member.id,
            workspaceId: workspace.id,
            name: "Electrical",
        })

        await expect(
            assetCategoryService.listCategories({
                userId: outsider.id,
                workspaceId: workspace.id,
            })
        ).rejects.toThrow()
    })

    it("does not return archived categories", async () => {
        const workspace = await createWorkspace()
        const owner = await createUser()

        await createMembership(owner.id, workspace.id, Role.OWNER)

        const category = await assetCategoryService.createCategory({
            userId: owner.id,
            workspaceId: workspace.id,
            name: "Electrical",
        })

        await assetCategoryService.deleteCategory({
            userId: owner.id,
            workspaceId: workspace.id,
            categoryId: category.id,
        })

        const categories = await assetCategoryService.listCategories({
            userId: owner.id,
            workspaceId: workspace.id,
        })

        expect(categories).toHaveLength(0)
    })
})

describe("assetCategoryService.deleteCategory", () => {
    it("archives category when only archived assets reference it", async () => {
        const workspace = await createWorkspace()
        const owner = await createUser()

        await createMembership(owner.id, workspace.id, Role.OWNER)

        const category = await assetCategoryService.createCategory({
            userId: owner.id,
            workspaceId: workspace.id,
            name: "Electrical",
        })

        const asset = await assetService.createAsset({
            userId: owner.id,
            workspaceId: workspace.id,
            name: "Generator",
            categoryId: category.id,
        })

        await assetService.archiveAsset({
            userId: owner.id,
            workspaceId: workspace.id,
            assetId: asset.id,
        })

        const archivedCategory = await assetCategoryService.deleteCategory({
            userId: owner.id,
            workspaceId: workspace.id,
            categoryId: category.id,
        })

        expect(archivedCategory.isDeleted).toBe(true)
    })

    it("rejects archiving category with active assets", async () => {
        const workspace = await createWorkspace()
        const owner = await createUser()

        await createMembership(owner.id, workspace.id, Role.OWNER)

        const category = await assetCategoryService.createCategory({
            userId: owner.id,
            workspaceId: workspace.id,
            name: "Electrical",
        })

        await assetService.createAsset({
            userId: owner.id,
            workspaceId: workspace.id,
            name: "Generator",
            categoryId: category.id,
        })

        await expect(
            assetCategoryService.deleteCategory({
                userId: owner.id,
                workspaceId: workspace.id,
                categoryId: category.id,
            })
        ).rejects.toThrow("Cannot archive category with active assets")
    })

    it("allows recreating category name after archive", async () => {
        const workspace = await createWorkspace()
        const owner = await createUser()

        await createMembership(owner.id, workspace.id, Role.OWNER)

        const category = await assetCategoryService.createCategory({
            userId: owner.id,
            workspaceId: workspace.id,
            name: "Electrical",
        })

        await assetCategoryService.deleteCategory({
            userId: owner.id,
            workspaceId: workspace.id,
            categoryId: category.id,
        })

        const recreated = await assetCategoryService.createCategory({
            userId: owner.id,
            workspaceId: workspace.id,
            name: "Electrical",
        })

        expect(recreated.id).not.toBe(category.id)
        expect(recreated.name).toBe("Electrical")
    })
})
