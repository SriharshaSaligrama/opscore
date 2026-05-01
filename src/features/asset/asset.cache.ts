import { revalidatePath } from "next/cache"

export function invalidateAssets() {
    revalidatePath("/assets")
}
