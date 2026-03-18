"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { selectWorkspace } from "@/features/workspace/workspace.actions"
import { WorkspacePromise } from "@/features/workspace/workspace.types"
import { useRouter } from "next/navigation"
import { use, useTransition } from "react"

export default function WorkspaceSwitcher({ workspacePromise }: { workspacePromise: WorkspacePromise }) {
    const { workspace, membershipWorkspaces } = use(workspacePromise)
    const router = useRouter()
    const [pending, startTransition] = useTransition()

    function handleSwitch(id: string) {
        startTransition(async () => {
            await selectWorkspace(id)
            router.refresh()
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="font-semibold flex items-center gap-2 border-primary active:border-primary">
                    {workspace.name}
                    {pending && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-56">
                {membershipWorkspaces.map((m) => (
                    <DropdownMenuItem
                        key={m.id}
                        disabled={workspace.id === m.id || pending}
                        onClick={() => handleSwitch(m.id)}
                        className="flex justify-between"
                    >
                        {m.name}

                        {workspace.id === m.id && (
                            <Check className="h-4 w-4 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}