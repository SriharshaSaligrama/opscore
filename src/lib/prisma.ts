// src/lib/prisma.ts

import { PrismaClient } from "@prisma/client"

export const prisma = new PrismaClient()

if (
    process.env.NODE_ENV !== "production" &&
    process.env.DATABASE_URL?.includes("production")
) {
    throw new Error(
        "🚨 Attempted to use production database in non-production environment."
    )
}