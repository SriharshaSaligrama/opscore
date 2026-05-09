"use client"

import { type ReactNode } from "react"
import PageHeader from "@/components/layout/page-header"
import { useOptimisticCollection } from "@/hooks/use-optimistic-collection"

type Identifiable = {
    id: string
}

export function CollectionContentShell<TItem extends Identifiable>({
    title,
    description,
    initialItems,
    actions,
    children,
}: {
    title: string
    description?: string
    initialItems: TItem[]
    actions?: (collection: ReturnType<typeof useOptimisticCollection<TItem>>) => ReactNode
    children: (collection: ReturnType<typeof useOptimisticCollection<TItem>>) => ReactNode
}) {
    const collection = useOptimisticCollection<TItem>(initialItems)

    return (
        <>
            <PageHeader
                title={title}
                description={description}
                actions={actions?.(collection)}
            />

            {children(collection)}
        </>
    )
}
