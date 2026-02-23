import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { authService } from "@/features/auth/auth.service"
import { BadRequestError } from "@/lib/errors"
import { withErrorHandler } from "@/lib/api-handler"

const signupSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(8)
})

export const POST = withErrorHandler(async (req: NextRequest) => {
    const body = await req.json()

    const parsed = signupSchema.safeParse(body)

    if (!parsed.success) {
        throw new BadRequestError(
            parsed.error.issues.map(issue => issue.message).join(", ")
        )
    }

    const { name, email, password } = parsed.data

    const { user, workspace } = await authService.signup(name, email, password)

    return NextResponse.json(
        {
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            workspace: {
                id: workspace.id,
                name: workspace.name
            }
        },
        { status: 201 }
    )
})