import { Suspense } from "react"
import WorkspaceGuard from "./WorkspaceGaurd"

export default async function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>
        <Suspense fallback={null}>
            <WorkspaceGuard />
        </Suspense>

        {children}
    </>
}