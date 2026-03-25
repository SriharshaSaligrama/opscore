// MemberStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMemberCount } from "@/features/dashboard/dashboard.service"
import { DashboardWorkSpace } from "@/features/dashboard/dashboard.types"
import { UsersRound } from "lucide-react"

export default async function MemberStats({ workspace }: { workspace: DashboardWorkSpace }) {
    const membersCount = await getMemberCount(workspace.id)

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                    Members
                </CardTitle>
                <UsersRound className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {membersCount === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No members in this workspace
                    </p>
                ) : (
                    <p className="text-2xl font-bold">{membersCount}</p>
                )}
            </CardContent>
        </Card>
    )
}