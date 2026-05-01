import { ForbiddenError, NotFoundError } from "@/lib/errors"

type WorkspaceScopedEntity = {
    workspaceId: string
    isDeleted?: boolean
}

export function ensureWorkspaceEntity<T extends WorkspaceScopedEntity>(
    entity: T | null,
    workspaceId: string,
    options: {
        notFoundMessage: string
        invalidWorkspaceMessage: string
        archivedMessage?: string
    }
) {
    if (!entity) {
        throw new NotFoundError(options.notFoundMessage)
    }

    if (entity.workspaceId !== workspaceId) {
        throw new ForbiddenError(options.invalidWorkspaceMessage)
    }

    if (options.archivedMessage && entity.isDeleted) {
        throw new ForbiddenError(options.archivedMessage)
    }

    return entity
}
