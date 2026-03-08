import { describe, it, expect } from "vitest"
import { prisma } from "@/lib/prisma"

import { workOrderService } from "@/features/work-order/work-order.service"

import { createUser } from "@/tests/factories/user.factory"
import { createWorkspaceForUser } from "@/tests/factories/workspace.factory"
import { createAssetForWorkspace } from "@/tests/factories/asset.factory"

describe("Work Order — Timeline Integrity", () => {
    it("records activity events for workflow actions", async () => {
        const user = await createUser()
        const workspace = await createWorkspaceForUser(user.id)

        const asset = await createAssetForWorkspace({
            userId: user.id,
            workspaceId: workspace.id,
        })

        const workOrder = await workOrderService.createWorkOrder({
            userId: user.id,
            workspaceId: workspace.id,
            assetId: asset.id,
            description: "Motor overheating",
        })

        await workOrderService.performAction({
            userId: user.id,
            workspaceId: workspace.id,
            workOrderId: workOrder.id,
            action: "assign",
            assigneeId: user.id,
        })

        await workOrderService.performAction({
            userId: user.id,
            workspaceId: workspace.id,
            workOrderId: workOrder.id,
            action: "start",
        })

        await workOrderService.performAction({
            userId: user.id,
            workspaceId: workspace.id,
            workOrderId: workOrder.id,
            action: "complete",
        })

        await workOrderService.performAction({
            userId: user.id,
            workspaceId: workspace.id,
            workOrderId: workOrder.id,
            action: "close",
        })

        // 📜 Fetch timeline
        const events = await prisma.domainEvent.findMany({
            where: {
                entityId: workOrder.id,
            },
            orderBy: { createdAt: "asc" },
        })

        // 🧪 Assertions
        expect(events.length).toBe(5)

        expect(events[0].type).toBe("WORK_ORDER_CREATED")
        expect(events[1].type).toBe("WORK_ORDER_ASSIGNED")
        expect(events[2].type).toBe("WORK_ORDER_STARTED")
        expect(events[3].type).toBe("WORK_ORDER_COMPLETED")
        expect(events[4].type).toBe("WORK_ORDER_CLOSED")

        // Ensure all events belong to same entity
        for (const e of events) {
            expect(e.entityId).toBe(workOrder.id)
            expect(e.workspaceId).toBe(workspace.id)
            expect(e.actorId).toBe(user.id)
        }
    }, 17000)
})