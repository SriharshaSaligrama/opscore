import PageHeader from "@/components/layout/page-header"
import CategoriesContent from "@/features/asset-category/components/categories-content"
import CategoriesLoading from "@/features/asset-category/components/categories-loading"
import CategoriesHeaderActionsLoading from "@/features/asset-category/components/categories-header-actions-loading"
import CategoriesHeaderActions from "@/features/asset-category/components/categories-header-actions"

import { Suspense } from "react"

export default function CategoriesPage() {
    return (
        <>
            <PageHeader
                title="Categories"
                description="Organize your assets"
                actions={
                    <Suspense fallback={<CategoriesHeaderActionsLoading />}>
                        <CategoriesHeaderActions />
                    </Suspense>
                }
            />

            <Suspense fallback={<CategoriesLoading />}>
                <CategoriesContent />
            </Suspense>
        </>
    )
}