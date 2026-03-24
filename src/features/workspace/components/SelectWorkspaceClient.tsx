"use client"

import { useActionState } from "react"
import { selectWorkspaceAction } from "@/features/workspace/actions/select-workspace.action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import AuthShell from "@/features/auth/components/AuthShell"

export default function SelectWorkspaceClient({ workspaces }: { workspaces: { id: string; name: string }[] }) {
    const [query, setQuery] = useState("")
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

            {state?.error && (
                <p className="text-sm text-red-500">{state.error}</p>
            )}
        </AuthShell>
    )
}