import CategoriesContent from "@/features/asset-category/components/categories-content"
import CategoriesLoading from "@/features/asset-category/components/categories-loading"

import { Suspense } from "react"

export default function CategoriesPage() {
    return (
        <Suspense fallback={<CategoriesLoading />}>
            <CategoriesContent />
        </Suspense>
    )
}