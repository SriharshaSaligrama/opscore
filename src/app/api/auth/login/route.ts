// src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { authService } from "@/features/auth/auth.service"
import { BadRequestError } from "@/lib/errors"
import { withErrorHandler } from "@/lib/api-handler"

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1)
})

export const POST = withErrorHandler(async (req: NextRequest) => {
    const body = await req.json()

    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
        throw new BadRequestError(
            parsed.error.issues.map(issue => issue.message).join(", ")
        )
    }

    const { email, password } = parsed.data

    const result = await authService.login(email, password)

    const response = NextResponse.json(result)

    // Set session cookie regardless of branch
    response.cookies.set("sessionId", result.sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60
    })

    return response
})