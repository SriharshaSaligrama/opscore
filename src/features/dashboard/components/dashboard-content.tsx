import AssetStats from "@/features/dashboard/components/asset-stats"
import CardSkeleton from "@/features/dashboard/components/card-skeleton"
import MemberStats from "@/features/dashboard/components/member-stats"
import WorkOrderStats from "@/features/dashboard/components/work-order-stats"
import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { Suspense } from "react"

export async function DashboardContent() {
    const { workspace } = await getWorkspaceContext()

    return (
        <div className="grid gap-6 md:grid-cols-3 pt-4">
            <Suspense key={workspace.id} fallback={<CardSkeleton />}>
                <WorkOrderStats workspace={workspace} />
            </Suspense>

            <Suspense key={workspace.id + "-assets"} fallback={<CardSkeleton />}>
                <AssetStats workspace={workspace} />
            </Suspense>

            <Suspense key={workspace.id + "-members"} fallback={<CardSkeleton />}>
                <MemberStats workspace={workspace} />
            </Suspense>
        </div>
    )
}