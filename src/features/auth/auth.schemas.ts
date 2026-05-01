import { z } from "zod"
import { createNameSchema } from "@/lib/name-validation"

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1, "Password is required"),
})

export const signupSchema = z.object({
    name: createNameSchema("User"),
    email: z.email(),
    password: z.string().min(1, "Password is required"),
})
