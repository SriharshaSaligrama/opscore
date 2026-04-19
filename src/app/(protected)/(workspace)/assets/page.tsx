import AssetsContent from "@/features/asset/components/assets-content"
import AssetsLoading from "@/features/asset/components/assets-loading"

import { Suspense } from "react"

export const metadata = {
    title: "Assets",
    description: "Manage your assets and inventory with Opscore's comprehensive asset management features.",
}

export default function AssetsPage() {
    return (
        <Suspense fallback={<AssetsLoading />}>
            <AssetsContent />
        </Suspense>
    )
}