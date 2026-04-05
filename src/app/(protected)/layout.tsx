// src/app/(protected)/layout.tsx

import { ReactNode, Suspense } from "react"
import { getAuthContext } from "@/features/auth/auth.context"
import ProtectedAuthFallback from "@/components/layout/protected-auth-fallback"

async function AuthGate({
    authPromise,
    children,
}: {
    authPromise: ReturnType<typeof getAuthContext>
    children: ReactNode
}) {
    await authPromise

    return <>{children}</>
}

export default function ProtectedLayout({
    children,
}: {
    children: ReactNode
}) {
    const authPromise = getAuthContext()

    return (
        <Suspense fallback={<ProtectedAuthFallback />}>
            <AuthGate authPromise={authPromise}>
                {children}
            </AuthGate>
        </Suspense>
    )
}
