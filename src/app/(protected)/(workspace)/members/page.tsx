import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";

export default function MembersPage() {
    return <PageHeader
        title="Members"
        description="Manage your workspace members"
        actions={
            <Button>
                + Invite Member
            </Button>
        }
    />
}