"use server"

import { authService } from "@/features/auth/auth.service"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { AppError } from "@/lib/errors"

const schema = z.object({
    email: z.email(),
    password: z.string().min(1),
})

export async function loginAction(_: unknown, formData: FormData) {
    const parsed = schema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    })

    if (!parsed.success) {
        return { error: "Invalid input" }
    }

    let result

    try {
        result = await authService.login(
            parsed.data.email,
            parsed.data.password
        )
    } catch (err) {
        if (err instanceof AppError) {
            return { error: err.message }
        }
        return { error: "Something went wrong" }
    }

    const cookieStore = await cookies()

    cookieStore.set("sessionId", result.sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    })

    // ✅ redirect OUTSIDE try/catch
    if (result.type === "NO_WORKSPACE") redirect("/no-workspace")
    if (result.type === "MULTIPLE_WORKSPACES") redirect("/select-workspace")

    redirect("/dashboard")
}