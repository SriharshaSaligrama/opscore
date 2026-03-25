import PageHeader from "@/components/layout/page-header";
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