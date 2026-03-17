import { Skeleton } from "@/components/ui/skeleton"

export default function WorkspaceLoading() {
    return (
        <div className="space-y-6">

            {/* Page Header */}
            <div>
                <Skeleton className="h-8 w-40 mb-2" />
                <Skeleton className="h-4 w-64" />
            </div>

            {/* Dashboard cards */}
            <div className="grid grid-cols-3 gap-6">
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
            </div>

        </div>
    )
}