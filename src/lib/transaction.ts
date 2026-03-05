import { prisma } from "@/lib/prisma"
import { DB } from "@/lib/db"

export async function withTransaction<T>(
    fn: (db: DB) => Promise<T>
): Promise<T> {
    return prisma.$transaction(async (tx) => {
        return fn(tx)
    })
}