import { describe, it, expect } from "vitest"
import { prisma } from "@/lib/prisma"

import { workOrderService } from "@/features/work-order/work-order.service"

import { createUser, createMembership } from "@/tests/factories/user.factory"
import { createWorkspaceForUser } from "@/tests/factories/workspace.factory"
import { createAssetForWorkspace } from "@/tests/factories/asset.factory"

describe("Work Order — Permission Boundaries", () => {
    it("prevents VIEWER from assigning a work order", async () => {
        // 👤 Create owner (creator)
        const owner = await createUser()
        const workspace = await createWorkspaceForUser(owner.id)

        // 👁 Create viewer
        const viewer = await createUser()
        await createMembership(viewer.id, workspace.id, "VIEWER")

        const asset = await createAssetForWorkspace({
            userId: owner.id,
            workspaceId: workspace.id,
        })

        const workOrder = await workOrderService.createWorkOrder({
            userId: owner.id,
            workspaceId: workspace.id,
            assetId: asset.id,
        })

        // 🚫 Viewer tries to assign
        await expect(
            workOrderService.performAction({
                userId: viewer.id,
                workspaceId: workspace.id,
                workOrderId: workOrder.id,
                action: "assign",
                assigneeId: viewer.id,
            })
        ).rejects.toThrow()

        // 🔍 Ensure status unchanged
        const fromDb = await prisma.workOrder.findUnique({
            where: { id: workOrder.id }
        })

        expect(fromDb?.status).toBe("OPEN")
    }, 10000)
})