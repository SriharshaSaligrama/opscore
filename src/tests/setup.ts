import { beforeEach } from "vitest"
import { prisma } from "@/lib/prisma"

if (process.env.NODE_ENV !== "test") {
    throw new Error("🚨 Tests must run with NODE_ENV=test")
}

beforeEach(async () => {
    await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
    "AssetCategory", 
    "Membership", 
    "Session", 
    "Workspace",
    "User" 
    RESTART IDENTITY CASCADE;
  `)
})