"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import CreateAssetDialog from "./create-asset-dialog"
import { Asset } from "@/features/asset/asset-types"

type Category = {
    id: string
    name: string
}

export default function AssetsHeaderActions({
    categories,
    onCreate,
}: {
    categories: Category[]
    onCreate?: (asset: Asset) => void
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
                onCreate={onCreate}
            />
        </>
    )
}