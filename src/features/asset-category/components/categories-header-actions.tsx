"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import CreateCategoryDialog from "./create-category-dialog"

export default function CategoriesHeaderActions({
    onCreate,
}: {
    onCreate?: (category: { id: string; name: string }) => void
}) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button onClick={() => setOpen(true)}>
                + Add Category
            </Button>

            <CreateCategoryDialog open={open} onOpenChange={setOpen} onCreate={onCreate} />
        </>
    )
}