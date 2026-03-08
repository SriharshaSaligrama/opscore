import { describe, it, expect } from "vitest"
import { prisma } from "@/lib/prisma"
import { workOrderService } from "@/features/work-order/work-order.service"

import { createUser } from "../factories/user.factory"
import { createWorkspaceForUser } from "../factories/workspace.factory"
import { createAssetForWorkspace } from "../factories/asset.factory"

describe("Work Order — Comment Timeline", () => {
    it("records technician comments as events", async () => {
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

        await workOrderService.addComment({
            userId: user.id,
            workspaceId: ws.id,
            workOrderId: wo.id,
            message: "Initial inspection completed",
        })

        const events = await prisma.domainEvent.findMany({
            where: { entityId: wo.id }
        })

        const commentEvent = events.find(e => e.type === "COMMENT_ADDED")

        expect(commentEvent).toBeDefined()
        expect(commentEvent?.message).toBe("Initial inspection completed")
    }, 10000)
})