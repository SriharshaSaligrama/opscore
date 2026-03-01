// src/app/api/categories/route.ts

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { cookies } from "next/headers"

import { assetCategoryService } from "@/features/asset-category/asset-category.service"
import { authService } from "@/features/auth/auth.service"
import { withErrorHandler } from "@/lib/api-handler"
import { BadRequestError, UnauthorizedError } from "@/lib/errors"

const createCategorySchema = z.object({
    name: z.string().min(1)
})

/**
 * POST /api/categories
 * Create new category
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
    const body = await req.json()

    const parsed = createCategorySchema.safeParse(body)

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

    const session = await authService.validateSession(sessionId)

    if (!session.activeWorkspaceId) {
        throw new BadRequestError("No active workspace selected")
    }

    const category = await assetCategoryService.createCategory({
        userId: session.userId,
        workspaceId: session.activeWorkspaceId,
        name: parsed.data.name,
    })

    return NextResponse.json(category, { status: 201 })
})

/**
 * GET /api/categories
 * List categories for active workspace
 */
export const GET = withErrorHandler(async () => {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("sessionId")?.value

    if (!sessionId) {
        throw new UnauthorizedError("Missing session")
    }

    const session = await authService.validateSession(sessionId)

    if (!session.activeWorkspaceId) {
        throw new BadRequestError("No active workspace selected")
    }

    const categories = await assetCategoryService.listCategories({
        userId: session.userId,
        workspaceId: session.activeWorkspaceId,
    })

    return NextResponse.json(categories)
})