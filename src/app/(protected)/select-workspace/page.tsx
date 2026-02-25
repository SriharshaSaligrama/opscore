import { Suspense } from "react"
import SelectWorkspaceContent from "./SelectWorkspaceContent"

export default function SelectWorkspacePage() {
    return (
        <Suspense fallback={null}>
            <SelectWorkspaceContent />
        </Suspense>
    )
}