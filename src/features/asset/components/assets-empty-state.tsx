export default function AssetsEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <h2 className="text-lg font-semibold">No assets yet</h2>

            <p className="text-sm text-muted-foreground max-w-sm">
                Assets help you track equipment, inventory, or any resources in your workspace.
            </p>
        </div>
    )
}