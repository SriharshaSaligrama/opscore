import PageHeader from "@/components/layout/page-header"
import AssetsContent from "@/features/asset/components/assets-content"
import AssetsLoading from "@/features/asset/components/assets-loading"
import AssetsHeaderActionsServer from "@/features/asset/components/assets-header-actions-server"
import AssetsHeaderActionsLoading from "@/features/asset/components/assets-header-actions-loading"

import { Suspense } from "react"

export default function AssetsPage() {
    return (
        <>
            <PageHeader
                title="Assets"
                description="Manage your workspace assets"
                actions={
                    <Suspense fallback={<AssetsHeaderActionsLoading />}>
                        <AssetsHeaderActionsServer />
                    </Suspense>
                }
            />

            <Suspense fallback={<AssetsLoading />}>
                <AssetsContent />
            </Suspense>
        </>
    )
}