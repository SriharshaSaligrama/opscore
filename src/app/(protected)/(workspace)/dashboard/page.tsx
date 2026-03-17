import { Suspense } from "react";
import { DashboardContent } from "./DashboardContent";
import PageHeader from "@/components/layout/PageHeader";

export default function DashboardPage() {
    return (
        <>
            <PageHeader
                title="Dashboard"
                description="Overview of your workspace activity"
            />
            <Suspense fallback={<div>Loading dashboard...</div>}>
                <DashboardContent />
            </Suspense>
        </>
    )
}