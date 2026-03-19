import { Skeleton } from "@/components/ui/skeleton"
import UserMenuSkeleton from "@/features/auth/components/UserDropdownSkeleton"
import CardSkeleton from "@/features/dashboard/components/CardSkeleton"
import WorkspaceSwitcherSkeleton from "@/features/workspace/components/WorkspaceSwitcherSkeleton"
import { Separator } from "@/components/ui/separator"

export default function WorkspaceShellFallback() {
    return (
        <div className="flex h-screen bg-background">
            <aside className="hidden w-64 border-r bg-card md:block">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-32 mt-4 ml-2" />
                    <Separator />
                    <div className="space-y-4 px-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                    </div>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-16 items-center justify-between border-b bg-background px-6">
                    <WorkspaceSwitcherSkeleton />

                    <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <UserMenuSkeleton />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-72" />
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                        </div>

                        <div className="space-y-3">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
