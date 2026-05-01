import { z } from "zod"

export const NAME_MAX_LENGTH = 30

export function createNameSchema(label: string) {
    return z
        .string()
        .trim()
        .min(1, `${label} name is required`)
        .max(NAME_MAX_LENGTH, `${label} name too long`)
}
