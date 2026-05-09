"use client"

import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DataTableShell } from "@/components/data-table/data-table-shell"
import {
    TableActionsCell,
    TableActionsHead,
} from "@/components/data-table/table-actions-cell"

import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

import EditCategoryDialog from "./edit-category-dialog"
import DeleteCategoryDialog from "./delete-category-dialog"
import CategoriesEmpty from "./categories-empty"


type Category = {
    id: string
    name: string
}

export default function CategoriesTable({
    categories,
    onCategoryUpdated,
    onCategoryDeleted,
    canUpdateCategory = true,
    canArchiveCategory = true,
}: {
    categories: Category[]
    onCategoryUpdated: (categoryId: string, updates: Partial<Category>) => void
    onCategoryDeleted?: (categoryId: string) => void
    canUpdateCategory?: boolean
    canArchiveCategory?: boolean
}) {
    const categoriesToRender = categories
    const canShowActions = canUpdateCategory || canArchiveCategory

    if (categories.length === 0) {
        return <CategoriesEmpty />
    }

    return (
        <DataTableShell>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        {canShowActions && <TableActionsHead />}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {categoriesToRender.map((c) => {
                        return (
                            <TableRow key={c.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="font-medium">
                                    {c.name}
                                </TableCell>

                                {canShowActions && (
                                    <TableActionsCell>
                                        {canUpdateCategory && (
                                            <EditCategoryDialog
                                                category={c}
                                                key={c.id}
                                                onOptimisticUpdate={(updates) => onCategoryUpdated(c.id, updates)}
                                            >
                                                <Button size="icon" variant="outline" className="h-8 w-8">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </EditCategoryDialog>
                                        )}

                                        {canArchiveCategory && (
                                            <DeleteCategoryDialog category={c} onDelete={onCategoryDeleted}>
                                                <Button size="icon" variant="destructive" className="h-8 w-8">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </DeleteCategoryDialog>
                                        )}
                                    </TableActionsCell>
                                )}
                            </TableRow>
                        )
                    })}
                </TableBody>
        </DataTableShell>
    )
}
