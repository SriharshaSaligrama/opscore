import { redirect } from "next/navigation"
import { z } from "zod"
import { fail, type ActionState } from "@/lib/action-handler"
import { AppError, BadRequestError } from "@/lib/errors"

function parseFormData<TInput>(schema: z.ZodType<TInput>, formData: FormData) {
    const parsed = schema.safeParse(Object.fromEntries(formData))

    if (!parsed.success) {
        throw new BadRequestError(
            parsed.error.issues.map((issue) => issue.message).join(", ")
        )
    }

    return parsed.data
}

export function createValidatedRedirectAction<TInput>(
    schema: z.ZodType<TInput>,
    handler: (data: TInput, formData: FormData) => Promise<string>,
    fallbackError = "Something went wrong"
) {
    return async (_: ActionState | null, formData: FormData) => {
        let destination: string

        try {
            const data = parseFormData(schema, formData)
            destination = await handler(data, formData)
        } catch (error) {
            if (error instanceof AppError) {
                return fail(error.message)
            }

            console.error("Unhandled Redirect Action Error:", error)
            return fail(fallbackError)
        }

        redirect(destination as Parameters<typeof redirect>[0])
    }
}
