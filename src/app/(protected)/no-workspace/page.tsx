import { Button } from "@/components/ui/button"
import AuthShell from "@/features/auth/components/auth-shell"

export default function NoWorkspacePage() {
    return (
        <AuthShell
            title="No workspace found"
            subtitle="You are not part of any workspace yet"
        >
            <Button className="w-full">
                Create Workspace (coming soon)
            </Button>
        </AuthShell>
    )
}