import AssetsContent from "@/features/asset/components/assets-content"
import AssetsLoading from "@/features/asset/components/assets-loading"

import { Suspense } from "react"

export default function AssetsPage() {
    return (
        <Suspense fallback={<AssetsLoading />}>
            <AssetsContent />
        </Suspense>
    )
}