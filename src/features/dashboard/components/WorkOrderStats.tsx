// WorkOrderStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getWorkOrderCount } from "@/features/dashboard/dashboard.service"
import { DashboardWorkSpace } from "@/features/dashboard/dashboard.types"
import { ClipboardList } from "lucide-react"

export default async function WorkOrderStats({ workspace }: { workspace: DashboardWorkSpace }) {
    const workOrdersCount = await getWorkOrderCount(workspace.id)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Work Orders
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{workOrdersCount}</p>
                <p className="text-sm text-muted-foreground">Open</p>
            </CardContent>
        </Card>
    )
}