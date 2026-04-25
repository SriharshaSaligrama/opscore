"use client"

import { useActionState, useState } from "react"
import { selectWorkspaceAction } from "@/features/workspace/actions/select-workspace.action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthShell from "@/features/auth/components/auth-shell"
import CreateWorkspaceDialog from "./create-workspace-dialog"

export default function SelectWorkspaceClient({
    workspaces,
    canCreateWorkspace,
    initialCreateOpen,
}: {
    workspaces: { id: string; name: string }[]
    canCreateWorkspace?: boolean
    initialCreateOpen?: boolean
}) {
    const [query, setQuery] = useState("")
    const [createOpen, setCreateOpen] = useState(initialCreateOpen ?? false)
    const [state, formAction, pending] = useActionState(selectWorkspaceAction, null)

    const filtered = workspaces.filter(w =>
        w.name.toLowerCase().includes(query.toLowerCase())
    )

    return (
        <AuthShell
            title="Select workspace"
            subtitle="Choose where you want to continue"
        >
            {workspaces.length > 5 && (
                <Input
                    placeholder="Search workspace..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto">
                {filtered.map(w => (
                    <form key={w.id} action={formAction}>
                        <input type="hidden" name="workspaceId" value={w.id} />
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            disabled={pending}
                        >
                            {w.name}
                        </Button>
                    </form>
                ))}
            </div>

            {canCreateWorkspace && (
                <Button
                    variant="ghost"
                    className="w-full justify-start mt-2"
                    onClick={() => setCreateOpen(true)}
                >
                    + Create New Workspace
                </Button>
            )}

            {state?.error && (
                <p className="text-sm text-red-500">{state.error}</p>
            )}

            <CreateWorkspaceDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
            />
        </AuthShell>
    )
}