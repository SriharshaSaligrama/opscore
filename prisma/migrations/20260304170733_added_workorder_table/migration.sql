-- CreateEnum
CREATE TYPE "public"."WorkOrderStatus" AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."WorkOrderPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "public"."WorkOrder" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "assignedTo" TEXT,
    "createdBy" TEXT NOT NULL,
    "status" "public"."WorkOrderStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "public"."WorkOrderPriority" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkOrder_workspaceId_idx" ON "public"."WorkOrder"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkOrder_workspaceId_status_idx" ON "public"."WorkOrder"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "WorkOrder_workspaceId_assetId_idx" ON "public"."WorkOrder"("workspaceId", "assetId");

-- CreateIndex
CREATE INDEX "WorkOrder_workspaceId_assignedTo_idx" ON "public"."WorkOrder"("workspaceId", "assignedTo");

-- CreateIndex
CREATE INDEX "WorkOrder_workspaceId_priority_idx" ON "public"."WorkOrder"("workspaceId", "priority");

-- AddForeignKey
ALTER TABLE "public"."WorkOrder" ADD CONSTRAINT "WorkOrder_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrder" ADD CONSTRAINT "WorkOrder_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "public"."Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrder" ADD CONSTRAINT "WorkOrder_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrder" ADD CONSTRAINT "WorkOrder_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
