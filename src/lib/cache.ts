/**
 * Centralized cache invalidation registry.
 *
 * Declares every cached path and the dependency graph between feature areas.
 * Invalidating a key automatically invalidates all downstream keys.
 *
 * Rules:
 *  - Never call revalidatePath() outside this file.
 *  - Each feature's existing invalidate*() helpers are kept as thin aliases
 *    so existing call-sites remain unchanged.
 *
 * Adding a new feature:
 *  1. Add its key + paths to CACHE_REGISTRY below.
 *  2. List which existing keys it "affects" (if any).
 *  3. Export a typed invalidate() alias.
 */

import { revalidatePath } from "next/cache"

// ---------------------------------------------------------------------------
// Registry definition
// ---------------------------------------------------------------------------

type CacheKey =
    | "assets"
    | "categories"
    | "workOrders"
    | "members"
    | "workspace"
    | "dashboard"

type CacheEntry = {
    /** Next.js paths to revalidate for this key. */
    paths: Array<{ path: string; type?: "layout" | "page" }>
    /** Other cache keys that must also be invalidated when this one is. */
    affects?: CacheKey[]
}

const CACHE_REGISTRY: Record<CacheKey, CacheEntry> = {
    assets: {
        paths: [{ path: "/assets" }],
        affects: ["dashboard"],
    },
    categories: {
        paths: [{ path: "/categories" }],
        affects: ["assets"],
    },
    workOrders: {
        paths: [{ path: "/work-orders" }],
        affects: ["dashboard"],
    },
    members: {
        paths: [{ path: "/members" }],
        affects: ["dashboard"],
    },
    workspace: {
        paths: [
            { path: "/select-workspace" },
            { path: "/settings" },
            { path: "/", type: "layout" },
        ],
    },
    dashboard: {
        paths: [{ path: "/dashboard" }],
    },
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

function invalidateKey(key: CacheKey, visited = new Set<CacheKey>()): void {
    if (visited.has(key)) return
    visited.add(key)

    const entry = CACHE_REGISTRY[key]

    for (const { path, type } of entry.paths) {
        revalidatePath(path, type)
    }

    for (const dep of entry.affects ?? []) {
        invalidateKey(dep, visited)
    }
}

/**
 * Invalidate one or more cache keys and their downstream dependencies.
 *
 * @example
 *   invalidateCache("categories")        // also invalidates "assets" + "dashboard"
 *   invalidateCache("assets", "members") // invalidates both + their deps
 */
export function invalidateCache(...keys: CacheKey[]): void {
    const visited = new Set<CacheKey>()
    for (const key of keys) {
        invalidateKey(key, visited)
    }
}

// ---------------------------------------------------------------------------
// Feature-scoped aliases (keeps existing call-sites unchanged)
// ---------------------------------------------------------------------------

/** @feature asset */
export function invalidateAssets() {
    invalidateCache("assets")
}

/** @feature asset-category */
export function invalidateCategories() {
    invalidateCache("categories")
}

/** @deprecated Use invalidateCategories() — it already cascades into assets. */
export function invalidateCategoriesAndAssets() {
    invalidateCache("categories")
}

/** @feature work-order */
export function invalidateWorkOrders() {
    invalidateCache("workOrders")
}

/** @feature membership */
export function invalidateMembers() {
    invalidateCache("members")
}

/** @feature workspace */
export function invalidateWorkspaceSelection() {
    invalidateCache("workspace")
}

export function invalidateWorkspaceSettings() {
    invalidateCache("workspace")
}

export function invalidateWorkspaceDashboard() {
    invalidateCache("dashboard")
}

export function invalidateWorkspaceLayout() {
    invalidateCache("workspace")
}
