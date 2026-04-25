import { getWorkspaceContext } from "@/features/workspace/workspace.context"
import PageHeader from "@/components/layout/page-header"
import SettingsContent from "@/features/workspace/components/settings-content"

export const metadata = {
    title: "Settings",
    description: "Manage your workspace settings",
}

export default async function SettingsPage() {
    const { workspace } = await getWorkspaceContext()

    return (
        <div className="space-y-6">
            <PageHeader
                title="Settings"
                description="Manage your workspace settings"
            />

            <SettingsContent initialName={workspace.name} key={workspace.name} />
        </div>
    )
}