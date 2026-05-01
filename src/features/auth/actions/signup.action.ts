"use server"

import { authService } from "@/features/auth/auth.service"
import { signupSchema } from "@/features/auth/auth.schemas"
import { createValidatedRedirectAction } from "@/lib/redirect-actions"
import { cookies } from "next/headers"

export const signupAction = createValidatedRedirectAction(
    signupSchema,
    async (data) => {
        await authService.signup(data.name, data.email, data.password)

        const login = await authService.login(data.email, data.password)

        const cookieStore = await cookies()
        cookieStore.set("sessionId", login.sessionId, {
            httpOnly: true,
            path: "/",
        })

        return "/dashboard"
    },
    "Signup failed"
)
