/**
 * Domain event service.
 *
 * DomainEventInput is now generically typed: the metadata field is constrained
 * to the shape declared in DomainEventMetadataMap for the given event type.
 * This ensures builder functions cannot pass structurally-wrong metadata.
 */

import { DB } from "@/lib/db"
import { prisma } from "@/lib/prisma"
import { DomainEntityType } from "@prisma/client"
import { DomainEventType, DomainEventMetadataMap } from "./domain-event.types"

// ---------------------------------------------------------------------------
// Typed event input
// ---------------------------------------------------------------------------

export type DomainEventInput<T extends DomainEventType = DomainEventType> = {
    workspaceId: string
    entityType: DomainEntityType
    entityId: string
    actorId: string
    type: T
    message?: string
    metadata?: DomainEventMetadataMap[T]
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export function recordDomainEvent(db: DB, event: DomainEventInput) {
    return domainEventService.record({ db, ...event })
}

type DomainEventRecordInput = DomainEventInput & { db?: DB }

export const domainEventService = {
    async record<T extends DomainEventType>({
        db = prisma,
        workspaceId,
        entityType,
        entityId,
        actorId,
        type,
        message,
        metadata,
    }: DomainEventRecordInput & { type: T; metadata?: DomainEventMetadataMap[T] }) {
        return db.domainEvent.create({
            data: {
                workspaceId,
                entityType,
                entityId,
                actorId,
                type,
                message,
                // Prisma stores metadata as Json; the typed metadata is always JSON-serialisable
                metadata,
            },
        })
    },

    async getTimeline({
        workspaceId,
        entityType,
        entityId,
    }: {
        workspaceId: string
        entityType: DomainEntityType
        entityId: string
    }) {
        return prisma.domainEvent.findMany({
            where: { workspaceId, entityType, entityId },
            include: {
                actor: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { createdAt: "asc" },
        })
    },
}
