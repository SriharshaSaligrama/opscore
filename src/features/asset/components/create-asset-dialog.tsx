"use client"

import { useState, useEffect, useRef } from "react"
import { useActionState } from "react"

import { createAssetAction } from "@/features/asset/actions/create-asset.action"

import { ActionState } from "@/types/action-state"

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

type Category = {
    id: string
    name: string
}

const initialState: ActionState = {
    success: false,
    error: null,
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

    const [state, formAction, pending] = useActionState(
        createAssetAction,
        initialState
    )

    const formRef = useRef<HTMLFormElement>(null)
    const wasPendingRef = useRef(false)

    // ✅ SAFE dialog close (correct pattern)
    useEffect(() => {
        if (wasPendingRef.current && !pending) {
            wasPendingRef.current = false

            const timer = setTimeout(() => {
                if (state.success) {
                    onOpenChange(false)
                    formRef.current?.reset()
                    setSelectedCategory(null)
                }
            }, 0)

            return () => clearTimeout(timer)
        }

        wasPendingRef.current = pending
    }, [pending, state.success, onOpenChange])

    function handleAction(formData: FormData) {
        wasPendingRef.current = true
        formAction(formData)
    }

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
                    <div className="space-y-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            You need at least one category before creating an asset.
                        </p>

                        <Button type="button">
                            Create Category
                        </Button>
                    </div>
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

                        {state.error && (
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