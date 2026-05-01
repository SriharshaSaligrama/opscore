export function activeInWorkspace(workspaceId: string) {
    return {
        workspaceId,
        isDeleted: false,
    }
}

export function caseInsensitiveName(name: string) {
    return {
        equals: name,
        mode: "insensitive" as const,
    }
}
