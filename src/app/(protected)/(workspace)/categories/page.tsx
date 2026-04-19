import CategoriesContent from "@/features/asset-category/components/categories-content"
import CategoriesLoading from "@/features/asset-category/components/categories-loading"

import { Suspense } from "react"

export const metadata = {
    title: "Categories",
    description: "Organize and manage your asset categories effectively with Opscore's intuitive category management features.",
}
export default function CategoriesPage() {
    return (
        <Suspense fallback={<CategoriesLoading />}>
            <CategoriesContent />
        </Suspense>
    )
}