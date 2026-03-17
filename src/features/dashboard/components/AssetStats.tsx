// AssetStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAssetCount } from "@/features/dashboard/dashboard.service"
import { DashboardWorkSpace } from "@/features/dashboard/dashboard.types"
import { FolderKanban } from "lucide-react"

export default async function AssetStats({ workspace }: { workspace: DashboardWorkSpace }) {
    const assetsCount = await getAssetCount(workspace.id)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4" />
                    Assets
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{assetsCount}</p>
                <p className="text-sm text-muted-foreground">Assets</p>
            </CardContent>
        </Card>
    )
}