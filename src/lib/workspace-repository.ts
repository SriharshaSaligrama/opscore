/**
 * Workspace repository utilities and generic factory.
 *
 * The factory receives a typed delegate accessor — a function from DB to the
 * specific Prisma model delegate — so there is no dynamic string indexing,
 * no `any`, and no eslint-disable comments. TypeScript infers every method's
 * argument and return types directly from the Prisma-generated delegate.
 *
 * Adding a new workspace-scoped repository:
 *
 *   import { createWorkspaceRepository } from "@/lib/workspace-repository"
 *   import { prisma } from "@/lib/prisma"
 *   import { DB } from "@/lib/db"
 *
 *   export const myEntityRepository = {
 *     ...createWorkspaceRepository((db: DB) => db.myEntity),
 *   }
 *
 * Advanced repos that need relations or custom methods simply spread the base:
 *
 *   export const assetRepository = {
 *     ...createWorkspaceRepository((db: DB) => db.asset),
 *     findByIdWithWorkOrders(id: string, db: DB = prisma) { ... },
 *   }
 */

import { prisma } from "@/lib/prisma"
import { DB } from "@/lib/db"

// ---------------------------------------------------------------------------
// Shared query helpers
// ---------------------------------------------------------------------------

export function activeInWorkspace(workspaceId: string) {
    return {
        workspaceId,
        isDeleted: false,
    }
}

export function caseInsensitiveName(name: string) {
    return {
        equals: name,
        mode: "insensitive" as const,
    }
}

// ---------------------------------------------------------------------------
// Delegate shape
//
// We describe only the four operations the factory actually calls.
// Prisma's generated delegates satisfy this interface — TypeScript will tell
// us if they ever stop doing so.
// ---------------------------------------------------------------------------

interface WorkspaceDelegate<TEntity> {
    findUnique(args: { where: { id: string } }): Promise<TEntity | null>

    findFirst(args: {
        where: {
            workspaceId: string
            isDeleted: boolean
            name: { equals: string; mode: "insensitive" }
            NOT?: { id: string }
        }
    }): Promise<TEntity | null>

    findMany(args: {
        where: { workspaceId: string; isDeleted: boolean }
        orderBy: { createdAt: "asc" }
    }): Promise<TEntity[]>

    update(args: {
        where: { id: string }
        data: { isDeleted: boolean }
    }): Promise<TEntity>
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a standard workspace-scoped repository from a typed delegate accessor.
 *
 * @param getDelegate - A function that receives a DB instance and returns the
 *   specific Prisma model delegate (e.g. `(db) => db.asset`).
 *   Using an accessor function instead of a string key means TypeScript resolves
 *   the concrete delegate type and infers all argument / return types precisely.
 */
export function createWorkspaceRepository<TEntity extends { id: string }>(
    getDelegate: (db: DB) => WorkspaceDelegate<TEntity>
) {
    return {
        findById(id: string, db: DB = prisma): Promise<TEntity | null> {
            return getDelegate(db).findUnique({ where: { id } })
        },

        findActiveByName(
            workspaceId: string,
            name: string,
            db: DB = prisma
        ): Promise<TEntity | null> {
            return getDelegate(db).findFirst({
                where: {
                    ...activeInWorkspace(workspaceId),
                    name: caseInsensitiveName(name),
                },
            })
        },

        findActiveByNameExcluding(
            workspaceId: string,
            name: string,
            excludeId: string,
            db: DB = prisma
        ): Promise<TEntity | null> {
            return getDelegate(db).findFirst({
                where: {
                    ...activeInWorkspace(workspaceId),
                    name: caseInsensitiveName(name),
                    NOT: { id: excludeId },
                },
            })
        },

        listActive(workspaceId: string, db: DB = prisma): Promise<TEntity[]> {
            return getDelegate(db).findMany({
                where: activeInWorkspace(workspaceId),
                orderBy: { createdAt: "asc" },
            })
        },

        softDelete(id: string, db: DB = prisma): Promise<TEntity> {
            return getDelegate(db).update({
                where: { id },
                data: { isDeleted: true },
            })
        },
    }
}
