import { AssetStatus } from "@prisma/client"

export type AssetActionState = {
    success: true
    error: null
} | {
    success: false
    error: string | null
}

export type Category = {
    id: string
    name: string
}

export type Asset = {
    id: string
    name: string
    status: AssetStatus
    category: Category
    categoryId: string
}