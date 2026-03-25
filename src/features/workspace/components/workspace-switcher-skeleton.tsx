import { Skeleton } from "@/components/ui/skeleton"

export default function WorkspaceSwitcherSkeleton() {
    return (
        <div className="h-6 w-41 rounded-md">
            <Skeleton className="h-full w-full" />
        </div>
    )
}