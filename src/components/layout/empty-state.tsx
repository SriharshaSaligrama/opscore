import { type LucideIcon } from "lucide-react"
import { type ReactNode } from "react"

/**
 * Generic empty-state component.
 *
 * Replaces: AssetsEmptyState, CategoriesEmpty, and any future feature empties.
 *
 * Usage:
 *   <EmptyState
 *     title="No assets yet"
 *     description="Assets help you track equipment in your workspace."
 *     action={<CreateAssetButton />}
 *   />
 */
export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
}: {
    icon?: LucideIcon
    title: string
    description?: string
    action?: ReactNode
}) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            {Icon && (
                <div className="rounded-full bg-muted p-4">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                </div>
            )}
            <h2 className="text-lg font-semibold">{title}</h2>
            {description && (
                <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
            )}
            {action && <div>{action}</div>}
        </div>
    )
}
