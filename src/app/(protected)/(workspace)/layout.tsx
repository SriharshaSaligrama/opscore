import { Suspense } from "react"
import WorkspaceGuard from "@/features/workspace/components/WorkspaceGaurd"
import AppLayout from "@/components/layout/AppLayout"

export default async function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>
        <Suspense fallback={null}>
            <WorkspaceGuard />
        </Suspense>

        <AppLayout>{children}</AppLayout>
    </>
}