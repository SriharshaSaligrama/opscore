import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AssetStatus } from "@prisma/client"

export default function AssetStatusBadge({
    status,
    className,
}: {
    status: AssetStatus
    className?: string
}) {
    switch (status) {
        case AssetStatus.ACTIVE:
            return (
                <Badge className={cn("bg-green-100 text-green-700 border-green-200", className)}>
                    Active
                </Badge>
            )

        case AssetStatus.INACTIVE:
            return (
                <Badge variant="secondary" className={className}>
                    Inactive
                </Badge>
            )

        case AssetStatus.MAINTENANCE:
            return (
                <Badge className={cn("bg-yellow-100 text-yellow-700 border-yellow-200", className)}>
                    Maintenance
                </Badge>
            )

        case AssetStatus.RETIRED:
            return (
                <Badge className={cn("bg-red-100 text-red-700 border-red-200", className)}>
                    Retired
                </Badge>
            )

        default:
            return <Badge variant="outline" className={className}>Unknown</Badge>
    }
}