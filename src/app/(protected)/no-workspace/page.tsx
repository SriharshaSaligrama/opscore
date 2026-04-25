"use client"

import { useState } from "react"
import AuthShell from "@/features/auth/components/auth-shell"
import CreateWorkspaceDialog from "@/features/workspace/components/create-workspace-dialog"

export default function NoWorkspacePage() {
    const [createOpen, setCreateOpen] = useState(true)

    return (
        <AuthShell
            title="No workspace found"
            subtitle="You are not part of any workspace yet. Create one to get started."
        >
            <CreateWorkspaceDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
            />
        </AuthShell>
    )
}