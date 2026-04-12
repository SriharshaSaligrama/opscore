"use client"

import { useState } from "react"

import { createAssetAction } from "@/features/asset/actions/create-asset.action"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import {
    Command,
    CommandInput,
    CommandItem,
    CommandList,
    CommandEmpty,
} from "@/components/ui/command"

import { ActionState } from "@/lib/action-handler"
import { useActionDialog } from "@/hooks/use-action-dialog"

type Category = {
    id: string
    name: string
}

const initialState: ActionState = {
    success: false,
    error: "",
}

export default function CreateAssetDialog({
    categories,
    open,
    onOpenChange,
}: {
    categories: Category[]
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const [categoryOpen, setCategoryOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

    const { state, pending, formRef, handleAction } = useActionDialog(
        createAssetAction,
        initialState,
        () => {
            onOpenChange(false)
            setSelectedCategory(null)
        }
    )

    const hasCategories = categories.length > 0

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="space-y-4">
                <DialogHeader>
                    <DialogTitle>Create Asset</DialogTitle>
                    <DialogDescription>
                        Add a new asset and assign it to a category.
                    </DialogDescription>
                </DialogHeader>

                {!hasCategories ? (
                    <p className="text-sm text-muted-foreground text-center">
                        You need at least one category before creating an asset.
                    </p>
                ) : (
                    <form ref={formRef} action={handleAction} className="space-y-4">

                        {/* Name */}
                        <Input name="name" placeholder="Asset name" />

                        {/* Category */}
                        <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-between"
                                >
                                    {selectedCategory?.name || "Select category"}
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="p-0">
                                <Command>
                                    <CommandInput placeholder="Search category..." />

                                    <CommandList>
                                        <CommandEmpty>No category found</CommandEmpty>

                                        {categories.map((c) => (
                                            <CommandItem
                                                key={c.id}
                                                value={c.name}
                                                onSelect={() => {
                                                    setSelectedCategory(c)
                                                    setCategoryOpen(false)
                                                }}
                                            >
                                                {c.name}
                                            </CommandItem>
                                        ))}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        <input
                            type="hidden"
                            name="categoryId"
                            value={selectedCategory?.id || ""}
                        />

                        {!state.success && state.error && (
                            <p className="text-sm text-red-500">{state.error}</p>
                        )}

                        <Button
                            type="submit"
                            disabled={pending || !selectedCategory}
                            className="w-full"
                        >
                            {pending && (
                                <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                            )}
                            {pending ? "Creating..." : "Create Asset"}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}