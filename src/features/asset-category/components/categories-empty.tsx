import { EmptyState } from "@/components/layout/empty-state"
import { Tag } from "lucide-react"

export default function CategoriesEmpty() {
    return (
        <EmptyState
            icon={Tag}
            title="No categories yet"
            description="Create a category to start organizing your assets."
        />
    )
}
