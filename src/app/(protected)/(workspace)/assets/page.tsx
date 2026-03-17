import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";

export default function AssetsPage() {
    return <PageHeader
        title="Assets"
        description="Manage your workspace assets"
        actions={
            <Button>
                + Add Asset
            </Button>
        }
    />
}