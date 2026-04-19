import PageHeader from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Work Orders",
    description: "Manage your workspace asset work orders",
}

export default function WorkOrdersPage() {
    return <PageHeader
        title="Work Orders"
        description="Manage your workspace asset work orders"
        actions={
            <Button>
                + Add Work Order
            </Button>
        }
    />
}