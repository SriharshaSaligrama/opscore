import { createNameSchema, NAME_MAX_LENGTH } from "@/lib/name-validation"

export const ASSET_NAME_MAX_LENGTH = NAME_MAX_LENGTH
export const assetNameSchema = createNameSchema("Asset")
