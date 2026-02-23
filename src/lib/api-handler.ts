import { NextRequest, NextResponse } from "next/server"
import { AppError } from "./errors"

type RouteHandler = (
    req: NextRequest
) => Promise<NextResponse>

export function withErrorHandler(handler: RouteHandler) {
    return async (req: NextRequest) => {
        try {
            return await handler(req)
        } catch (error) {
            if (error instanceof AppError) {
                return NextResponse.json(
                    { message: error.message },
                    { status: error.statusCode }
                )
            }

            console.error("Unhandled Error:", error)

            return NextResponse.json(
                { message: "Internal Server Error" },
                { status: 500 }
            )
        }
    }
}