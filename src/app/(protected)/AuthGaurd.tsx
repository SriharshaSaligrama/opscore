import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"

export default async function AuthGuard() {
    const session = await getCurrentSession()

    if (!session) {
        redirect("/login")
    }

    return null
}