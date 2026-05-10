import AssetStats from "@/features/dashboard/components/asset-stats"
import CardSkeleton from "@/features/dashboard/components/card-skeleton"
import MemberStats from "@/features/dashboard/components/member-stats"
import WorkOrderStats from "@/features/dashboard/components/work-order-stats"
import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import { Suspense } from "react"

export async function DashboardContent() {
    const { session, workspace } = await getWorkspaceContext()

    const ctx = { userId: session.user.id, workspace }

    return (
        <div className="grid gap-6 md:grid-cols-3 pt-4">
            <Suspense key={workspace.id} fallback={<CardSkeleton />}>
                <WorkOrderStats ctx={ctx} />
            </Suspense>

            <Suspense key={workspace.id + "-assets"} fallback={<CardSkeleton />}>
                <AssetStats ctx={ctx} />
            </Suspense>

            <Suspense key={workspace.id + "-members"} fallback={<CardSkeleton />}>
                <MemberStats ctx={ctx} />
            </Suspense>
        </div>
    )
}
