// AssetStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAssetCount } from "@/features/dashboard/dashboard.service"
import { DashboardWorkSpace } from "@/features/dashboard/dashboard.types"
import { FolderKanban } from "lucide-react"

export default async function AssetStats({ workspace }: { workspace: DashboardWorkSpace }) {
    const assetsCount = await getAssetCount(workspace.id)

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                    Assets
                </CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {assetsCount === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No assets added yet
                    </p>
                ) : (
                    <p className="text-2xl font-bold">{assetsCount}</p>
                )}
            </CardContent>
        </Card>
    )
}