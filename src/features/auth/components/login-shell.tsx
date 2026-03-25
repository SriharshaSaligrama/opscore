import { getCurrentSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ReactNode } from "react"

export default async function LoginShell({
    children,
}: {
    children: ReactNode
}) {
    const session = await getCurrentSession()

    // ✅ Already logged in → redirect away
    if (session && session.user.id) {
        redirect("/dashboard")
    }

    return <>{children}</>
}