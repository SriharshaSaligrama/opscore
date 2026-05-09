import { DB } from "@/lib/db"
import { ConflictError } from "@/lib/errors"
import { isUniqueConstraintError } from "@/lib/prisma-errors"
import { withTransaction } from "@/lib/transaction"
import { Permission } from "@/features/authorization/permissions"
import { DomainEventInput, recordDomainEvent } from "@/features/domain-events/domain-event.service"
import { getServiceContext, ServiceContext } from "@/lib/service-context"

type MutationEvent =
    | DomainEventInput
    | DomainEventInput[]
    | Promise<DomainEventInput | DomainEventInput[] | unknown>
    | unknown

async function recordMutationEvents(db: DB, events: unknown) {
    if (!events) return

    if (Array.isArray(events)) {
        await Promise.all(events.map((event) => recordMutationEvents(db, event)))
        return
    }

    if (
        typeof events === "object" &&
        "workspaceId" in events &&
        "entityType" in events &&
        "entityId" in events &&
        "actorId" in events &&
        "type" in events
    ) {
        await recordDomainEvent(db, events as DomainEventInput)
    }
}

export function runWorkspaceMutation<T>(
    fn: (db: DB) => Promise<T>,
    options?: {
        uniqueConflictMessage?: string
        event?: (result: T, db: DB) => MutationEvent
    }
) {
    return withTransaction(async (db) => {
        try {
            const result = await fn(db)

            if (options?.event) {
                await recordMutationEvents(db, await options.event(result, db))
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

export function runWorkspaceMutationWithContext<T>({
    userId,
    workspaceId,
    permission,
    mutation,
    uniqueConflictMessage,
    event,
}: {
    userId: string
    workspaceId: string
    permission?: Permission
    mutation: (ctx: ServiceContext, db: DB) => Promise<T>
    uniqueConflictMessage?: string
    event?: (result: T, ctx: ServiceContext, db: DB) => MutationEvent
}) {
    return runWorkspaceMutation(async (db) => {
        const ctx = await getServiceContext(userId, workspaceId, permission, db)
        const result = await mutation(ctx, db)

        return { ctx, result }
    }, {
        uniqueConflictMessage,
        event: ({ ctx, result }, db) => event?.(result, ctx, db),
    }).then(({ result }) => result)
}
