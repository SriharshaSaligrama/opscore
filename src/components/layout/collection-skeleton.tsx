import PageSkeleton from "@/components/layout/page-skeleton"

/**
 * Generic collection loading skeleton.
 *
 * Replaces: AssetsLoading, CategoriesLoading, and any future feature loadings.
 *
 * Usage:
 *   export default function AssetsLoading() {
 *     return <CollectionSkeleton rows={4} actions={2} />
 *   }
 */
export function CollectionSkeleton({
    rows = 3,
    actions = 1,
}: {
    rows?: number
    actions?: number
}) {
    return <PageSkeleton rowCount={rows} actionCount={actions} />
}
