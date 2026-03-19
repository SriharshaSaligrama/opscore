import { Suspense } from "react"
import AppLayout from "@/components/layout/AppLayout"
import WorkspaceShellFallback from "@/components/layout/WorkspaceShellFallback"
import { getWorkspaceContext } from "@/features/workspace/workspace.context"

async function WorkspaceGate({
    workspacePromise,
    children,
}: {
    workspacePromise: ReturnType<typeof getWorkspaceContext>
    children: React.ReactNode
}) {
    await workspacePromise

    return <AppLayout>{children}</AppLayout>
}

export default function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode
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
