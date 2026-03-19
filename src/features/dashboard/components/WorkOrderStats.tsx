// WorkOrderStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getWorkOrderCount } from "@/features/dashboard/dashboard.service"
import { DashboardWorkSpace } from "@/features/dashboard/dashboard.types"
import { ClipboardList } from "lucide-react"

export default async function WorkOrderStats({ workspace }: { workspace: DashboardWorkSpace }) {
    const workOrdersCount = await getWorkOrderCount(workspace.id)

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                    Work Orders
                </CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent>
                {workOrdersCount === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No work orders yet
                    </p>
                ) : (
                    <p className="text-2xl font-bold">{workOrdersCount}</p>
                )}
            </CardContent>
        </Card>
    )
}