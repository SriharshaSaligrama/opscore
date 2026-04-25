// WorkspaceSwitcherView.tsx

"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { selectWorkspace } from "@/features/workspace/workspace.actions"

export function WorkspaceSwitcherView({
    workspace,
    membershipWorkspaces,
    canCreateWorkspace,
}: {
    workspace: { id: string; name: string }
    membershipWorkspaces: { id: string; name: string }[]
    canCreateWorkspace?: boolean
}) {
    const router = useRouter()
    const [pending, startTransition] = useTransition()

    function handleSwitch(id: string) {
        startTransition(async () => {
            try {
                await selectWorkspace(id)
                router.refresh()
            } catch (e) {
                console.error("Workspace switch failed", e)
            }
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="font-semibold flex items-center gap-2">
                    {workspace.name}
                    {pending && <Loader2 className="h-4 w-4 animate-spin" />}
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
                        {workspace.id === m.id && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                ))}

                {canCreateWorkspace && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => router.push("/select-workspace")}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Create New Workspace
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}