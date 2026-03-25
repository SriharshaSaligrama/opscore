import PageHeader from "@/components/layout/page-header";
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