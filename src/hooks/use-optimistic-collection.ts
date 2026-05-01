"use client"

import { useState } from "react"

type Identifiable = {
    id: string
}

export function useOptimisticCollection<TItem extends Identifiable>(
    initialItems: TItem[]
) {
    const [items, setItems] = useState<TItem[]>(initialItems)

    function append(item: TItem) {
        setItems((current) => [...current, item])
    }

    function patch(id: string, updates: Partial<TItem>) {
        setItems((current) =>
            current.map((item) =>
                item.id === id ? { ...item, ...updates } : item
            )
        )
    }

    function remove(id: string) {
        setItems((current) => current.filter((item) => item.id !== id))
    }

    return {
        items,
        setItems,
        append,
        patch,
        remove,
    }
}
