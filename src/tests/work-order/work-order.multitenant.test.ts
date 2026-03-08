import { describe, it, expect } from "vitest"
import { workOrderService } from "@/features/work-order/work-order.service"

import { createUser } from "@/tests/factories/user.factory"
import { createWorkspaceForUser } from "@/tests/factories/workspace.factory"
import { createAssetForWorkspace } from "@/tests/factories/asset.factory"

describe("Work Order — Multi-Tenant Isolation", () => {
    it("prevents access across workspaces", async () => {
        const userA = await createUser()
        const wsA = await createWorkspaceForUser(userA.id)

        const userB = await createUser()
        const wsB = await createWorkspaceForUser(userB.id)

        const asset = await createAssetForWorkspace({
            userId: userA.id,
            workspaceId: wsA.id,
        })

        const wo = await workOrderService.createWorkOrder({
            userId: userA.id,
            workspaceId: wsA.id,
            assetId: asset.id,
        })

        await expect(
            workOrderService.performAction({
                userId: userB.id,
                workspaceId: wsB.id,
                workOrderId: wo.id,
                action: "assign",
                assigneeId: userB.id,
            })
        ).rejects.toThrow()
    }, 10000)
})