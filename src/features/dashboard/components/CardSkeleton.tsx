import { Skeleton } from "@/components/ui/skeleton"

export default function CardSkeleton() {
    return (
        <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-8 w-16" />
        </div>
    )
}