// MemberStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMemberCount } from "@/features/dashboard/dashboard.service"
import { DashboardWorkSpace } from "@/features/dashboard/dashboard.types"
import { UsersRound } from "lucide-react"

export default async function MemberStats({ workspace }: { workspace: DashboardWorkSpace }) {
    const membersCount = await getMemberCount(workspace.id)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UsersRound className="h-4 w-4" />
                    Members
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{membersCount}</p>
                <p className="text-sm text-muted-foreground">Members</p>
            </CardContent>
        </Card>
    )
}