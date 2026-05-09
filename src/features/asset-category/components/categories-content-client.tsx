"use client"

import CategoriesHeaderActions from "./categories-header-actions"
import CategoriesTable from "./categories-table"
import { CollectionContentShell } from "@/components/data-table/collection-content-shell"

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
    return (
        <CollectionContentShell
            title="Categories"
            description="Organize your assets"
            initialItems={initialCategories}
            actions={(categories) =>
                capabilities.canCreateCategory ? (
                    <CategoriesHeaderActions onCreate={categories.append} />
                ) : null
            }
        >
            {(categories) => (
                <CategoriesTable
                    categories={categories.items}
                    onCategoryUpdated={categories.patch}
                    onCategoryDeleted={categories.remove}
                    canUpdateCategory={capabilities.canUpdateCategory}
                    canArchiveCategory={capabilities.canArchiveCategory}
                />
            )}
        </CollectionContentShell>
    )
}
