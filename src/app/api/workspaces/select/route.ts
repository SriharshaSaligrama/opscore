import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { workspaceService } from "@/features/workspace/workspace.service"
import { withErrorHandler } from "@/lib/api-handler"
import { BadRequestError, UnauthorizedError } from "@/lib/errors"
import { cookies } from "next/headers"

const selectSchema = z.object({
    workspaceId: z.uuid()
})

export const POST = withErrorHandler(async (req: NextRequest) => {
    const formData = await req.formData()

    const workspaceId = formData.get("workspaceId")

    if (typeof workspaceId !== "string") {
        throw new BadRequestError("Invalid workspaceId")
    }

    const parsed = selectSchema.safeParse({ workspaceId })

    if (!parsed.success) {
        throw new BadRequestError(
            parsed.error.issues.map(issue => issue.message).join(", ")
        )
    }

    const cookieStore = await cookies()
    const sessionId = cookieStore.get("sessionId")?.value

    if (!sessionId) {
        throw new UnauthorizedError("Missing session")
    }

    await workspaceService.selectWorkspace(
        sessionId,
        parsed.data.workspaceId
    )

    return NextResponse.redirect(
        new URL("/dashboard", req.url)
    )
})