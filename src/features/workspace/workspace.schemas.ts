import { createNameSchema, NAME_MAX_LENGTH } from "@/lib/name-validation"

export const WORKSPACE_NAME_MAX_LENGTH = NAME_MAX_LENGTH
export const workspaceNameSchema = createNameSchema("Workspace")
