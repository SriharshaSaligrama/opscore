import { getAuthContext } from "@/features/auth/auth.context"

export default async function AuthGuard() {
    await getAuthContext()

    return null
}