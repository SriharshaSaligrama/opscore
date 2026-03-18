export type WorkspacePromise = Promise<{
    session: {
        sessionId: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
        activeWorkspaceId: string | null;
        expiresAt: Date;
    };
    workspace: {
        id: string;
        name: string;
    };
    membershipWorkspaces: {
        id: string;
        name: string;
    }[];
    user: {
        id: string;
        name: string;
        email: string;
    };
}>