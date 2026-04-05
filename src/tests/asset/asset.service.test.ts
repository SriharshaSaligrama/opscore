import { describe, expect, it } from "vitest";
import { createWorkspace } from "@/tests/factories/workspace.factory";
import { createMembership, createUser } from "@/tests/factories/user.factory";
import { AssetStatus, Role } from "@prisma/client";
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
        })).rejects.toThrow("Invalid category")
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

describe("assetService.updateAsset", () => {
    it("should update asset name and status successfully", async () => {
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

        const updatedAsset = await assetService.updateAsset({
            userId: owner.id,
            workspaceId: workspace.id,
            assetId: asset.id,
            name: "Main Generator",
            status: AssetStatus.INACTIVE
        })

        expect(updatedAsset.name).toBe("Main Generator")
        expect(updatedAsset.status).toBe(AssetStatus.INACTIVE)
    })

    it("allows category change within workspace", async () => {
        const workspace = await createWorkspace()
        const owner = await createUser()

        await createMembership(
            owner.id,
            workspace.id,
            Role.OWNER
        )

        const categoryA = await assetCategoryService.createCategory({
            userId: owner.id,
            workspaceId: workspace.id,
            name: "Electrical",
        })

        const categoryB = await assetCategoryService.createCategory({
            userId: owner.id,
            workspaceId: workspace.id,
            name: "Plumbing",
        })

        const asset = await assetService.createAsset({
            userId: owner.id,
            workspaceId: workspace.id,
            name: "Generator",
            categoryId: categoryA.id
        })

        const updatedAsset = await assetService.updateAsset({
            userId: owner.id,
            workspaceId: workspace.id,
            assetId: asset.id,
            categoryId: categoryB.id
        })

        expect(updatedAsset.categoryId).toBe(categoryB.id)
    })

    it("cannot update archived asset", async () => {
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

        await expect(
            assetService.updateAsset({
                userId: owner.id,
                workspaceId: workspace.id,
                assetId: asset.id,
                name: "Updated",
            })
        ).rejects.toThrow()
    })

    it("rejects if user lacks UPDATE_ASSET permission", async () => {
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

        const asset = await assetService.createAsset({
            userId: owner.id,
            workspaceId: workspace.id,
            name: "Generator",
            categoryId: category.id
        })

        await expect(assetService.updateAsset({
            userId: viewer.id,
            workspaceId: workspace.id,
            assetId: asset.id,
            name: "Updated Generator",
            status: AssetStatus.INACTIVE
        })).rejects.toThrow()
    })

    it("rejects if category belongs to another workspace", async () => {
        const workspaceA = await createWorkspace()
        const workspaceB = await createWorkspace()
        const user = await createUser()

        await createMembership(user.id, workspaceA.id, Role.OWNER)
        await createMembership(user.id, workspaceB.id, Role.OWNER)

        const categoryA = await assetCategoryService.createCategory({
            userId: user.id,
            workspaceId: workspaceA.id,
            name: "Electrical",
        })

        const categoryB = await assetCategoryService.createCategory({
            userId: user.id,
            workspaceId: workspaceB.id,
            name: "Electrical",
        })

        const asset = await assetService.createAsset({
            userId: user.id,
            workspaceId: workspaceB.id,
            name: "Generator",
            categoryId: categoryB.id
        })

        await expect(assetService.updateAsset({
            userId: user.id,
            workspaceId: workspaceB.id,
            assetId: asset.id,
            categoryId: categoryA.id
        })).rejects.toThrow("Invalid category")

    })

    it("rejects if user is not a member of workspace", async () => {
        const workspace = await createWorkspace()
        const owner = await createUser()
        const outsider = await createUser()

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
            categoryId: category.id
        })

        await expect(assetService.updateAsset({
            userId: outsider.id,
            workspaceId: workspace.id,
            assetId: asset.id,
            name: "Updated Generator"
        })).rejects.toThrow()
    })

    it("rejects if asset does not exist", async () => {
        const workspace = await createWorkspace()
        const owner = await createUser()

        await createMembership(owner.id, workspace.id, Role.OWNER)

        await expect(assetService.updateAsset({
            userId: owner.id,
            workspaceId: workspace.id,
            assetId: "non-existent-asset-id",
            name: "Updated Generator"
        })).rejects.toThrow()
    })

    it("rejects if asset belongs to another workspace", async () => {
        const workspaceA = await createWorkspace()
        const workspaceB = await createWorkspace()
        const user = await createUser()

        await createMembership(user.id, workspaceA.id, Role.OWNER)
        await createMembership(user.id, workspaceB.id, Role.OWNER)

        const categoryA = await assetCategoryService.createCategory({
            userId: user.id,
            workspaceId: workspaceA.id,
            name: "Electrical",
        })

        const asset = await assetService.createAsset({
            userId: user.id,
            workspaceId: workspaceA.id,
            name: "Generator",
            categoryId: categoryA.id
        })

        await expect(assetService.updateAsset({
            userId: user.id,
            workspaceId: workspaceB.id,
            assetId: asset.id,
            name: "Updated Generator",
            categoryId: categoryA.id
        })).rejects.toThrow("Invalid asset")
    })

    it("rejects if category does not exist", async () => {
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
            categoryId: category.id
        })

        await expect(assetService.updateAsset({
            userId: owner.id,
            workspaceId: workspace.id,
            assetId: asset.id,
            categoryId: "non-existent-category-id"
        })).rejects.toThrow("Category not found")
    })
})

describe("assetService.listAssets", () => {
    it("returns only assets from user's workspace", async () => {
        const workspaceA = await createWorkspace()
        const workspaceB = await createWorkspace()
        const user = await createUser()

        await Promise.all([
            createMembership(user.id, workspaceA.id, Role.OWNER),
            createMembership(user.id, workspaceB.id, Role.OWNER),
        ])

        const [categoryA, categoryB] = await Promise.all([
            assetCategoryService.createCategory({
                userId: user.id,
                workspaceId: workspaceA.id,
                name: "Electrical",
            }),
            assetCategoryService.createCategory({
                userId: user.id,
                workspaceId: workspaceB.id,
                name: "Electrical",
            })
        ])

        const [assetA, assetB] = await Promise.all([
            assetService.createAsset({
                userId: user.id,
                workspaceId: workspaceA.id,
                name: "Generator A",
                categoryId: categoryA.id
            }),
            assetService.createAsset({
                userId: user.id,
                workspaceId: workspaceB.id,
                name: "Generator B",
                categoryId: categoryB.id
            })
        ])

        const [assetsA, assetsB] = await Promise.all([
            assetService.listAssets({
                userId: user.id,
                workspaceId: workspaceA.id,
            }),
            assetService.listAssets({
                userId: user.id,
                workspaceId: workspaceB.id,
            })
        ])

        expect(assetsA).toHaveLength(1)
        expect(assetsA[0].id).toBe(assetA.id)
        expect(assetsB).toHaveLength(1)
        expect(assetsB[0].id).toBe(assetB.id)
    }, 10000)

    it("rejects if user is not a member of workspace", async () => {
        const workspace = await createWorkspace()
        const member = await createUser()
        const outsider = await createUser()

        await createMembership(member.id, workspace.id, Role.OWNER)

        await expect(assetService.listAssets({
            userId: outsider.id,
            workspaceId: workspace.id,
        })).rejects.toThrow()
    })

    it("does not return archived assets", async () => {
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
            categoryId: category.id
        })

        await assetService.archiveAsset({
            userId: owner.id,
            workspaceId: workspace.id,
            assetId: asset.id
        })

        const assets = await assetService.listAssets({
            userId: owner.id,
            workspaceId: workspace.id,
        })

        expect(assets).toHaveLength(0)
    })
})