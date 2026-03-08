-- CreateEnum
CREATE TYPE "public"."DomainEntityType" AS ENUM ('WORK_ORDER', 'ASSET');

-- CreateTable
CREATE TABLE "public"."DomainEvent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "entityType" "public"."DomainEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DomainEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DomainEvent_workspaceId_idx" ON "public"."DomainEvent"("workspaceId");

-- CreateIndex
CREATE INDEX "DomainEvent_entityType_entityId_idx" ON "public"."DomainEvent"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "public"."DomainEvent" ADD CONSTRAINT "DomainEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DomainEvent" ADD CONSTRAINT "DomainEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
