import { type ReactNode } from "react"
import { Table } from "@/components/ui/table"

export function DataTableShell({ children }: { children: ReactNode }) {
    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>{children}</Table>
        </div>
    )
}
