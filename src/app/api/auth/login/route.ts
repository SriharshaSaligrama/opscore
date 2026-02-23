import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { authService } from "@/features/auth/auth.service"
import { BadRequestError } from "@/lib/errors"
import { withErrorHandler } from "@/lib/api-handler"

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
})

export const POST = withErrorHandler(async (req: NextRequest) => {
    const body = await req.json()

    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
        throw new BadRequestError("Invalid login input")
    }

    const { email, password } = parsed.data

    const { user, session } = await authService.login(email, password)

    const response = NextResponse.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    })

    response.cookies.set("sessionId", session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: session.expiresAt
    })

    return response
})