import { revalidatePath } from "next/cache"

export function invalidateWorkspaceSelection() {
    revalidatePath("/select-workspace")
}

export function invalidateWorkspaceSettings() {
    revalidatePath("/settings")
}

export function invalidateWorkspaceDashboard() {
    revalidatePath("/dashboard")
}

export function invalidateWorkspaceLayout() {
    revalidatePath("/", "layout")
}
