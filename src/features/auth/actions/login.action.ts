"use server"

import { authService } from "@/features/auth/auth.service"
import { loginSchema } from "@/features/auth/auth.schemas"
import { createValidatedRedirectAction } from "@/lib/redirect-actions"
import { cookies } from "next/headers"

export const loginAction = createValidatedRedirectAction(
    loginSchema,
    async (data) => {
        const result = await authService.login(data.email, data.password)

        const cookieStore = await cookies()

        cookieStore.set("sessionId", result.sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        })

        if (result.type === "NO_WORKSPACE") return "/no-workspace"
        if (result.type === "MULTIPLE_WORKSPACES") return "/select-workspace"

        return "/dashboard"
    },
    "Something went wrong"
)
