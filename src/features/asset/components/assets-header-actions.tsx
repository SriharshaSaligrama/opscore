"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import CreateAssetDialog from "./create-asset-dialog"

type Category = {
    id: string
    name: string
}

export default function AssetsHeaderActions({
    categories,
}: {
    categories: Category[]
}) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button onClick={() => setOpen(true)}>
                + Add Asset
            </Button>

            <CreateAssetDialog
                open={open}
                onOpenChange={setOpen}
                categories={categories}
            />
        </>
    )
}