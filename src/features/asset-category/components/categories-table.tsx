"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

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
}: {
    categories: Category[]
    onCategoryUpdated: (categoryId: string, updates: Partial<Category>) => void
    onCategoryDeleted?: (categoryId: string) => void
}) {
    const categoriesToRender = categories

    if (categories.length === 0) {
        return <CategoriesEmpty />
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right w-30">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {categoriesToRender.map((c) => {
                        return (
                            <TableRow key={c.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="font-medium">
                                    {c.name}
                                </TableCell>

                                <TableCell className="text-right space-x-2 flex items-center justify-end">
                                    <EditCategoryDialog
                                        category={c}
                                        key={c.id}
                                        onOptimisticUpdate={(updates) => onCategoryUpdated(c.id, updates)}
                                    >
                                        <Button size="icon" variant="outline" className="h-8 w-8">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </EditCategoryDialog>

                                    <DeleteCategoryDialog category={c} onDelete={onCategoryDeleted}>
                                        <Button size="icon" variant="destructive" className="h-8 w-8">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </DeleteCategoryDialog>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}