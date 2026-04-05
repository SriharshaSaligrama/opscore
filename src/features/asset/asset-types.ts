import { AssetStatus } from "@prisma/client"

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