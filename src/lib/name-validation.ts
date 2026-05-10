/**
 * Name validation helpers.
 *
 * Provides both the Zod schema factory (for server-action layer parsing)
 * and the runtime guard (for service-layer enforcement after trimming).
 * Both share the same max-length constant, so validation rules can never drift.
 */

import { z } from "zod"
import { BadRequestError } from "@/lib/errors"

export const NAME_MAX_LENGTH = 30

/** Build a Zod schema that trims, rejects blank, and enforces length. */
export function createNameSchema(label: string) {
    return z
        .string()
        .trim()
        .min(1, `${label} name is required`)
        .max(NAME_MAX_LENGTH, `${label} name too long`)
}

/**
 * Runtime guard used inside service methods after trimming.
 * Throws a BadRequestError with a context-aware message.
 *
 * @example
 *   name = name.trim()
 *   validateEntityName(name, { label: "Asset", max: ASSET_NAME_MAX_LENGTH })
 */
export function validateEntityName(
    name: string,
    options: { label: string; max?: number }
): void {
    const max = options.max ?? NAME_MAX_LENGTH

    if (!name) {
        throw new BadRequestError(`${options.label} name is required`)
    }

    if (name.length > max) {
        throw new BadRequestError(`${options.label} name is too long (max ${max} characters)`)
    }
}
