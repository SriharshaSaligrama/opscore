import { DB } from "@/lib/db"
import { ConflictError } from "@/lib/errors"
import { isUniqueConstraintError } from "@/lib/prisma-errors"
import { withTransaction } from "@/lib/transaction"

export function runWorkspaceMutation<T>(
    fn: (db: DB) => Promise<T>,
    options?: {
        uniqueConflictMessage?: string
        event?: (result: T, db: DB) => Promise<unknown>
    }
) {
    return withTransaction(async (db) => {
        try {
            const result = await fn(db)

            if (options?.event) {
                await options.event(result, db)
            }

            return result
        } catch (error) {
            if (options?.uniqueConflictMessage && isUniqueConstraintError(error)) {
                throw new ConflictError(options.uniqueConflictMessage)
            }

            throw error
        }
    })
}
