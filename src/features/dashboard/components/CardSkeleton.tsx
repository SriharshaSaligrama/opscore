import { Skeleton } from "@/components/ui/skeleton"

export default function CardSkeleton() {
    return (
        <div className="rounded-lg border p-4 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-32" />
        </div>
    )
}