// src/app/(protected)/auth-gaurd.tsx

import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth"

export default async function AuthGuard() {
    const user = await getSessionUser()

    if (!user) {
        redirect("/login")
    }

    return null
}