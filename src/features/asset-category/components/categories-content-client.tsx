"use client"

import PageHeader from "@/components/layout/page-header"
import CategoriesHeaderActions from "./categories-header-actions"
import CategoriesTable from "./categories-table"
import { useOptimisticCollection } from "@/hooks/use-optimistic-collection"

type Category = {
    id: string
    name: string
}

export default function CategoriesContentClient({
    initialCategories,
    capabilities,
}: {
    initialCategories: Category[]
    capabilities: {
        canCreateCategory: boolean
        canUpdateCategory: boolean
        canArchiveCategory: boolean
    }
}) {
    const categories = useOptimisticCollection<Category>(initialCategories)

    return (
        <>
            <PageHeader
                title="Categories"
                description="Organize your assets"
                actions={
                    capabilities.canCreateCategory ? (
                        <CategoriesHeaderActions onCreate={categories.append} />
                    ) : null
                }
            />

            <CategoriesTable
                categories={categories.items}
                onCategoryUpdated={categories.patch}
                onCategoryDeleted={categories.remove}
                canUpdateCategory={capabilities.canUpdateCategory}
                canArchiveCategory={capabilities.canArchiveCategory}
            />
        </>
    )
}
