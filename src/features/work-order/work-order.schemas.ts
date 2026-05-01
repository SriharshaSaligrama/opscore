import { WorkOrderPriority } from "@prisma/client"
import { z } from "zod"

export const createWorkOrderSchema = z.object({
    assetId: z.string().min(1, "Asset is required"),
    description: z.string().optional(),
    priority: z.enum(Object.values(WorkOrderPriority)).optional(),
})
