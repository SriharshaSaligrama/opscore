import { AssetStatus } from "@prisma/client"

// ✅ Safe bridge between Prisma enum and Zod
export const ASSET_STATUS_VALUES = Object.values(AssetStatus) as [
    AssetStatus,
    ...AssetStatus[]
]