/**
 * Re-exports the centralized cache invalidation helpers for the asset feature.
 * All revalidatePath calls are now owned by src/lib/cache.ts.
 */
export { invalidateAssets } from "@/lib/cache"
