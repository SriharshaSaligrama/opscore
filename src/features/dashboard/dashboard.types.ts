import { Workspace } from "@prisma/client";

export type DashboardWorkSpace = Omit<Workspace, 'createdAt'>