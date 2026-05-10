/**
 * Re-exports the centralized cache invalidation helpers for the workspace feature.
 * All revalidatePath calls are now owned by src/lib/cache.ts.
 */
export {
    invalidateWorkspaceSelection,
    invalidateWorkspaceSettings,
    invalidateWorkspaceDashboard,
    invalidateWorkspaceLayout,
} from "@/lib/cache"
