import { type ReactNode } from "react"
import { TableCell, TableHead } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export function TableActionsHead({ className }: { className?: string }) {
    return (
        <TableHead className={cn("text-right w-30", className)}>
            Actions
        </TableHead>
    )
}

export function TableActionsCell({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <TableCell className={cn("text-right space-x-2 flex items-center justify-end", className)}>
            {children}
        </TableCell>
    )
}
