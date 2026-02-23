// src/app/(protected)/layout.tsx

import React, { Suspense } from "react"
import AuthGuard from "./AuthGaurd"

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Suspense fallback={null}>
                <AuthGuard />
            </Suspense>

            {children}
        </>
    )
}