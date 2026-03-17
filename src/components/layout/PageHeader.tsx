import { ReactNode } from "react"

export default function PageHeader({
    title,
    description,
    actions,
}: {
    title: string
    description?: string
    actions?: ReactNode
}) {
    return (
        <div className="flex items-start justify-between mb-6">
            <div>
                <h1 className="text-2xl font-semibold">{title}</h1>

                {description && (
                    <p className="text-sm text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
            </div>

            {actions && (
                <div className="flex items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    )
}