import { revalidatePath } from "next/cache"
import { invalidateAssets } from "@/features/asset/asset.cache"

export function invalidateCategories() {
    revalidatePath("/categories")
}

export function invalidateCategoriesAndAssets() {
    invalidateCategories()
    invalidateAssets()
}
