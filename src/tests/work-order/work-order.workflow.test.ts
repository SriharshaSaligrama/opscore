import { describe, it, expect } from "vitest"

import { workOrderService } from "@/features/work-order/work-order.service"

import { createUser } from "@/tests/factories/user.factory"
import { createWorkspaceForUser } from "@/tests/factories/workspace.factory"
import { createAssetForWorkspace } from "@/tests/factories/asset.factory"
import { prisma } from "@/lib/prisma"

describe("Work Order — Workflow Lifecycle", () => {

    it("completes full lifecycle from creation to closure", async () => {

        // 👤 Create user + workspace
        const user = await createUser()
        const workspace = await createWorkspaceForUser(user.id)

        // 🏭 Create asset
        const asset = await createAssetForWorkspace({
            userId: user.id,
            workspaceId: workspace.id
        })

        // 📝 Create work order
        const workOrder = await workOrderService.createWorkOrder({
            userId: user.id,
            workspaceId: workspace.id,
            assetId: asset.id,
            description: "Pump malfunction",
        })

        expect(workOrder.status).toBe("OPEN")

        // 📌 Assign
        const assigned = await workOrderService.performAction({
            userId: user.id,
            workspaceId: workspace.id,
            workOrderId: workOrder.id,
            action: "assign",
            assigneeId: user.id,
        })

        expect(assigned.status).toBe("ASSIGNED")
        expect(assigned.assignedTo).toBe(user.id)

        // ▶ Start
        const started = await workOrderService.performAction({
            userId: user.id,
            workspaceId: workspace.id,
            workOrderId: workOrder.id,
            action: "start",
        })

        expect(started.status).toBe("IN_PROGRESS")

        // ✅ Complete
        const completed = await workOrderService.performAction({
            userId: user.id,
            workspaceId: workspace.id,
            workOrderId: workOrder.id,
            action: "complete",
        })

        expect(completed.status).toBe("COMPLETED")

        // 🔒 Close
        const closed = await workOrderService.performAction({
            userId: user.id,
            workspaceId: workspace.id,
            workOrderId: workOrder.id,
            action: "close",
        })

        expect(closed.status).toBe("CLOSED")

        const fromDb = await prisma.workOrder.findUnique({
            where: { id: workOrder.id }
        })

        expect(fromDb?.status).toBe("CLOSED")
    }, 20000)
})