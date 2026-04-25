"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import RenameWorkspaceDialog from "./rename-workspace-dialog"

export default function SettingsContent({ initialName }: { initialName: string }) {
    const [renameOpen, setRenameOpen] = useState(false)
    const [workspaceName, setWorkspaceName] = useState(initialName)

    return (
        <>
            <div className="border rounded-lg p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm">{workspaceName}</p>
                </div>
                <Button variant="outline" onClick={() => setRenameOpen(true)}>
                    Rename
                </Button>
            </div>

            <RenameWorkspaceDialog
                currentName={workspaceName}
                open={renameOpen}
                onOpenChange={setRenameOpen}
                onRename={setWorkspaceName}
            />
        </>
    )
}