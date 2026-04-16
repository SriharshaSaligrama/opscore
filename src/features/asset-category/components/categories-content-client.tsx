"use client"

import { useState } from "react"
import PageHeader from "@/components/layout/page-header"
import CategoriesHeaderActions from "./categories-header-actions"
import CategoriesTable from "./categories-table"

type Category = {
    id: string
    name: string
}

export default function CategoriesContentClient({
    initialCategories,
}: {
    initialCategories: Category[]
}) {
    const [categories, setCategories] = useState<Category[]>(initialCategories)

    function handleCategoryCreated(category: Category) {
        setCategories((prev) => [...prev, category])
    }

    function handleCategoryUpdated(id: string, updates: Partial<Category>) {
        setCategories((prev) =>
            prev.map((category) =>
                category.id === id ? { ...category, ...updates } : category
            )
        )
    }

    function handleCategoryDeleted(id: string) {
        setCategories((prev) => prev.filter((category) => category.id !== id))
    }

    return (
        <>
            <PageHeader
                title="Categories"
                description="Organize your assets"
                actions={
                    <CategoriesHeaderActions onCreate={handleCategoryCreated} />
                }
            />

            <CategoriesTable
                categories={categories}
                onCategoryUpdated={handleCategoryUpdated}
                onCategoryDeleted={handleCategoryDeleted}
            />
        </>
    )
}
