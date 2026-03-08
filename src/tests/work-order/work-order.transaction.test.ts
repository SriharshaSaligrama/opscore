import { describe, it, expect } from "vitest"
import { prisma } from "@/lib/prisma"
import { workOrderService } from "@/features/work-order/work-order.service"

import { createUser } from "../factories/user.factory"
import { createWorkspaceForUser } from "../factories/workspace.factory"
import { createAssetForWorkspace } from "../factories/asset.factory"

describe("Work Order — Transaction Safety", () => {
    it("rolls back when transition fails", async () => {
        const user = await createUser()
        const ws = await createWorkspaceForUser(user.id)

        const asset = await createAssetForWorkspace({
            userId: user.id,
            workspaceId: ws.id,
        })

        const wo = await workOrderService.createWorkOrder({
            userId: user.id,
            workspaceId: ws.id,
            assetId: asset.id,
        })

        // Invalid transition: OPEN → COMPLETE
        await expect(
            workOrderService.performAction({
                userId: user.id,
                workspaceId: ws.id,
                workOrderId: wo.id,
                action: "complete",
            })
        ).rejects.toThrow()

        const events = await prisma.domainEvent.findMany({
            where: { entityId: wo.id }
        })

        // Only creation event should exist
        expect(events.length).toBe(1)
        expect(events[0].type).toBe("WORK_ORDER_CREATED")
    }, 10000)
})