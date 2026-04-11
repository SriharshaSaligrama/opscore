// src/lib/validated-action.ts

import { z } from "zod"
import { handleAction } from "./action-handler"

export function createValidatedAction<TOutput>(
    schema: z.ZodType<TOutput>,
    handler: (data: TOutput, formData: FormData) => Promise<void>
) {
    return async (_: unknown, formData: FormData) => {
        return handleAction(async () => {
            const raw = Object.fromEntries(formData)

            const parsed = schema.safeParse(raw)

            if (!parsed.success) {
                throw new Error(
                    parsed.error.issues.map(i => i.message).join(", ")
                )
            }

            await handler(parsed.data, formData)
        })
    }
}