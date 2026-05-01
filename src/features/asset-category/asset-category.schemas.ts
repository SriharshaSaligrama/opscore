import { createNameSchema, NAME_MAX_LENGTH } from "@/lib/name-validation"

export const CATEGORY_NAME_MAX_LENGTH = NAME_MAX_LENGTH
export const categoryNameSchema = createNameSchema("Category")
