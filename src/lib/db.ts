import { PrismaClient, Prisma } from "@prisma/client"

/**
 * DB client usable by repositories and services.
 *
 * It can be either:
 * - PrismaClient (normal usage)
 * - Prisma.TransactionClient (inside transactions)
 */
export type DB = PrismaClient | Prisma.TransactionClient