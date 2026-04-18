-- Add soft delete support to categories.
ALTER TABLE "public"."AssetCategory"
ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- Full category-name uniqueness blocks recreating a category after archive.
DROP INDEX IF EXISTS "public"."AssetCategory_workspaceId_name_key";

-- Enforce active-name uniqueness while allowing archived historical duplicates.
CREATE UNIQUE INDEX "Asset_workspaceId_name_active_key"
ON "public"."Asset" ("workspaceId", lower("name"))
WHERE "isDeleted" = false;

CREATE UNIQUE INDEX "AssetCategory_workspaceId_name_active_key"
ON "public"."AssetCategory" ("workspaceId", lower("name"))
WHERE "isDeleted" = false;

CREATE INDEX "Asset_workspaceId_isDeleted_idx"
ON "public"."Asset" ("workspaceId", "isDeleted");

CREATE INDEX "AssetCategory_workspaceId_isDeleted_idx"
ON "public"."AssetCategory" ("workspaceId", "isDeleted");
