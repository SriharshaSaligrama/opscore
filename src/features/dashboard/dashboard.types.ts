/** Shared context shape passed to dashboard stat components. */
export type DashboardContext = {
    userId: string
    workspace: {
        id: string
        name: string
    }
}
