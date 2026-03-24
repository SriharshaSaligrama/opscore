import AuthShell from "@/features/auth/components/AuthShell"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoginShellLoading() {
    return (
        <AuthShell
            title="Loading..."
            subtitle="Preparing your session"
        >
            <div className="space-y-4">
                {/* Input skeletons */}
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />

                {/* Button skeleton */}
                <Skeleton className="h-6 w-full" />
            </div>
            {/* Footer text */}
            <Skeleton className="h-4 w-50 mx-auto pt-4" />
        </AuthShell>
    )
}