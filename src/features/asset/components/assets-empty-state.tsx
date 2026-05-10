import { EmptyState } from "@/components/layout/empty-state"
import { Wrench } from "lucide-react"

export default function AssetsEmptyState() {
    return (
        <EmptyState
            icon={Wrench}
            title="No assets yet"
            description="Assets help you track equipment, inventory, or any resources in your workspace."
        />
    )
}
