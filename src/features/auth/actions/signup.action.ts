"use server"

import { authService } from "@/features/auth/auth.service"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AppError } from "@/lib/errors"

export async function signupAction(_: unknown, formData: FormData) {
    try {
        const name = formData.get("name") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        await authService.signup(name, email, password)

        const login = await authService.login(email, password)

        const cookieStore = await cookies()
        cookieStore.set("sessionId", login.sessionId, {
            httpOnly: true,
            path: "/",
        })

    } catch (err) {
        if (err instanceof AppError) {
            return { error: err.message }
        }
        return { error: "Signup failed" }
    }
    redirect("/dashboard")
}