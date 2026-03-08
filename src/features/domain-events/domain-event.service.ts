import { DB } from "@/lib/db"
import { prisma } from "@/lib/prisma"
import { DomainEventType } from "./domain-event.types"
import { DomainEntityType, Prisma } from "@prisma/client"

type RecordEventInput = {
    db?: DB
    workspaceId: string
    entityType: DomainEntityType
    entityId: string
    actorId: string
    type: DomainEventType
    message?: string
    metadata?: Prisma.InputJsonValue
}

export const domainEventService = {
    async record({
        db = prisma,
        workspaceId,
        entityType,
        entityId,
        actorId,
        type,
        message,
        metadata,
    }: RecordEventInput) {

        return db.domainEvent.create({
            data: {
                workspaceId,
                entityType,
                entityId,
                actorId,
                type,
                message,
                metadata,
            }
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
            where: {
                workspaceId,
                entityType,
                entityId,
            },
            include: {
                actor: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        })
    }
}