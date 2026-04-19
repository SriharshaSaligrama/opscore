import PageHeader from "@/components/layout/page-header";
import { DashboardContent } from "@/features/dashboard/components/dashboard-content";

export const metadata = {
    title: "Dashboard",
    description: "Overview of your workspace activity",
}

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