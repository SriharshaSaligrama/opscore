import { z } from "zod"
import { handleAction } from "@/lib/action-handler"
import { BadRequestError } from "@/lib/errors"
import { getAuthContext } from "@/features/auth/auth.context"
import { getWorkspaceContext } from "@/features/workspace/workspace.context"

type AuthActionContext = Awaited<ReturnType<typeof getAuthContext>> & {
    userId: string
}

type WorkspaceActionContext = Awaited<ReturnType<typeof getWorkspaceContext>> & {
    userId: string
    workspaceId: string
}

function parseFormData<TInput>(schema: z.ZodType<TInput>, formData: FormData) {
    const parsed = schema.safeParse(Object.fromEntries(formData))

    if (!parsed.success) {
        throw new BadRequestError(
            parsed.error.issues.map((issue) => issue.message).join(", ")
        )
    }

    return parsed.data
}

export function createAuthenticatedServerAction<TOutput = void>(
    handler: (ctx: AuthActionContext, formData: FormData) => Promise<TOutput>
) {
    return async (_: unknown, formData: FormData) => {
        return handleAction(async () => {
            const auth = await getAuthContext()

            return handler(
                {
                    ...auth,
                    userId: auth.session.user.id,
                },
                formData
            )
        })
    }
}

export function createValidatedAuthenticatedServerAction<TInput, TOutput = void>(
    schema: z.ZodType<TInput>,
    handler: (
        data: TInput,
        ctx: AuthActionContext,
        formData: FormData
    ) => Promise<TOutput>
) {
    return createAuthenticatedServerAction(async (ctx, formData) => {
        const data = parseFormData(schema, formData)

        return handler(data, ctx, formData)
    })
}

export function createWorkspaceServerAction<TOutput = void>(
    handler: (ctx: WorkspaceActionContext, formData: FormData) => Promise<TOutput>
) {
    return async (_: unknown, formData: FormData) => {
        return handleAction(async () => {
            const workspaceContext = await getWorkspaceContext()

            return handler(
                {
                    ...workspaceContext,
                    userId: workspaceContext.session.user.id,
                    workspaceId: workspaceContext.workspace.id,
                },
                formData
            )
        })
    }
}

export function createValidatedWorkspaceServerAction<TInput, TOutput = void>(
    schema: z.ZodType<TInput>,
    handler: (
        data: TInput,
        ctx: WorkspaceActionContext,
        formData: FormData
    ) => Promise<TOutput>
) {
    return createWorkspaceServerAction(async (ctx, formData) => {
        const data = parseFormData(schema, formData)

        return handler(data, ctx, formData)
    })
}
