import PageHeader from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getWorkspaceContext } from "@/features/workspace/workspace.context";
import { Plus } from "lucide-react";

export const metadata = {
    title: "Members",
    description: "Manage your workspace members",
}

export default async function MembersPage() {
    const { canInviteUsers } = await getWorkspaceContext()

    return <PageHeader
        title="Members"
        description="Manage your workspace members"
        actions={canInviteUsers ? (
            <Button>
                <Plus />
                Invite Member
            </Button>
        ) : undefined}
    />
}
