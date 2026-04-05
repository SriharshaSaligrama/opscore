import { ReactNode, Suspense } from "react"
import AppLayout from "@/components/layout/app-layout"
import WorkspaceShellFallback from "@/components/layout/workspace-shell-fallback"
import { getWorkspaceContext } from "@/features/workspace/workspace.context"

async function WorkspaceGate({
    workspacePromise,
    children,
}: {
    workspacePromise: ReturnType<typeof getWorkspaceContext>
    children: ReactNode
}) {
    await workspacePromise

    return <AppLayout>{children}</AppLayout>
}

export default function WorkspaceLayout({
    children,
}: {
    children: ReactNode
}) {
    const workspacePromise = getWorkspaceContext()

    return (
        <Suspense fallback={<WorkspaceShellFallback />}>
            <WorkspaceGate workspacePromise={workspacePromise}>
                {children}
            </WorkspaceGate>
        </Suspense>
    )
}
