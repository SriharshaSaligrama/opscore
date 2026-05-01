import { Role } from "@prisma/client"
import { z } from "zod"

export const sendInvitationSchema = z.object({
    email: z.email(),
    role: z.enum(Object.values(Role)),
})

export const acceptInvitationSchema = z.object({
    token: z.string().min(1, "Invitation token is required"),
})
