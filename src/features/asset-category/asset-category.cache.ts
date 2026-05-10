/**
 * Re-exports the centralized cache invalidation helpers for the asset-category feature.
 * All revalidatePath calls are now owned by src/lib/cache.ts.
 */
export { invalidateCategories, invalidateCategoriesAndAssets } from "@/lib/cache"
