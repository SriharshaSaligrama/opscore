-- AlterTable
ALTER TABLE "public"."Session" ADD COLUMN     "activeWorkspaceId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_activeWorkspaceId_fkey" FOREIGN KEY ("activeWorkspaceId") REFERENCES "public"."Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
