-- CreateTable
CREATE TABLE "public"."AssetCategory" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssetCategory_workspaceId_idx" ON "public"."AssetCategory"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "AssetCategory_workspaceId_name_key" ON "public"."AssetCategory"("workspaceId", "name");

-- AddForeignKey
ALTER TABLE "public"."AssetCategory" ADD CONSTRAINT "AssetCategory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
