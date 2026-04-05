export type ActionState = {
    success: true
    error: null
} | {
    success: false
    error: string | null
}