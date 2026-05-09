import PageHeader from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getWorkspaceContext } from "@/features/workspace/workspace.context";
import { Plus } from "lucide-react";

export const metadata = {
    title: "Work Orders",
    description: "Manage your workspace asset work orders",
}

export default async function WorkOrdersPage() {
    const { canCreateWorkOrder } = await getWorkspaceContext()

    return <PageHeader
        title="Work Orders"
        description="Manage your workspace asset work orders"
        actions={canCreateWorkOrder ? (
            <Button>
                <Plus />
                Add Work Order
            </Button>
        ) : undefined}
    />
}
