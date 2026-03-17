import { Skeleton } from "@/components/ui/skeleton"
import CardSkeleton from "@/features/dashboard/components/CardSkeleton"

export default function WorkspaceLoading() {
    return (
        <div className="space-y-6">

            {/* Page Header */}
            <div>
                <Skeleton className="h-8 w-40 mb-2" />
                <Skeleton className="h-4 w-64" />
            </div>

            {/* Dashboard cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
            </div>

        </div>
    )
}