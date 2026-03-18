import { Suspense } from "react"
import SelectWorkspaceContent from "@/features/workspace/components/SelectWorkspaceContent"

export default function SelectWorkspacePage() {
    return (
        <Suspense fallback={null}>
            <SelectWorkspaceContent />
        </Suspense>
    )
}