import PageHeader from "@/components/layout/PageHeader";
import { DashboardContent } from "@/features/dashboard/components/DashboardContent";

export default function DashboardPage() {
    return (
        <>
            <PageHeader
                title="Dashboard"
                description="Overview of your workspace activity"
            />

            <DashboardContent />
        </>
    )
}