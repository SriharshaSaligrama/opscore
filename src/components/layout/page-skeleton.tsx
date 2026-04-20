import { Skeleton } from "@/components/ui/skeleton"

export default function PageSkeleton({
    rowCount = 3,
    actionCount = 1,
    titleWidth = "w-40",
    descriptionWidth = "w-64",
    actionWidth = "w-28",
}: {
    rowCount?: number
    actionCount?: number
    titleWidth?: string
    descriptionWidth?: string
    actionWidth?: string
}) {
    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className={`h-8 ${titleWidth}`} />
                    <Skeleton className={`h-4 ${descriptionWidth}`} />
                </div>

                <div className="flex items-center gap-2">
                    {Array.from({ length: actionCount }).map((_, index) => (
                        <Skeleton key={index} className={`h-10 ${actionWidth}`} />
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                {Array.from({ length: rowCount }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full" />
                ))}
            </div>
        </div>
    )
}
