// src/lib/action-handler.ts

import { AppError } from "./errors"

export type ActionState<T = undefined> =
    | { success: true; data: T }
    | { success: true } // no data case
    | { success: false; error: string }

export function ok(): ActionState {
    return { success: true }
}

export function okWithData<T>(data: T): ActionState<T> {
    return { success: true, data }
}

export function fail(error: string): ActionState {
    return { success: false, error }
}

export async function handleAction<T>(
    fn: () => Promise<T>
): Promise<ActionState<T>> {
    try {
        const result = await fn()

        if (result == null) {
            return ok()
        }

        return okWithData(result)
    } catch (err) {
        if (err instanceof AppError) {
            return fail(err.message)
        }

        console.error("Unhandled Action Error:", err)
        return fail("Something went wrong")
    }
}