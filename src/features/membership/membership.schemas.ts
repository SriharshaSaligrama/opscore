import { Role } from "@prisma/client"
import { z } from "zod"

export const membershipRoleSchema = z.enum(Object.values(Role))
