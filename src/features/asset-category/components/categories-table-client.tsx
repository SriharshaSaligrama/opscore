"use client"

import CategoriesTable from "./categories-table"

export default function CategoriesTableClient({
    categories,
}: {
    categories: { id: string; name: string }[]
}) {
    return <CategoriesTable categories={categories} />
}