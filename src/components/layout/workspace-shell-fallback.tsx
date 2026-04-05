import { Skeleton } from "@/components/ui/skeleton"
import UserMenuSkeleton from "@/features/auth/components/user-dropdown-skeleton"
import CardSkeleton from "@/features/dashboard/components/card-skeleton"
import WorkspaceSwitcherSkeleton from "@/features/workspace/components/workspace-switcher-skeleton"
import { Separator } from "@/components/ui/separator"
import { LayoutDashboard, Tag, Package, ClipboardList, Users, Settings } from "lucide-react"

const sidebarItems = [
    { labelWidth: "w-24", icon: LayoutDashboard, active: true },
    { labelWidth: "w-24", icon: Tag, active: true },
    { labelWidth: "w-16", icon: Package, active: true },
    { labelWidth: "w-28", icon: ClipboardList, active: true },
    { labelWidth: "w-20", icon: Users, active: true },
    { labelWidth: "w-20", icon: Settings, active: true },
]

export default function WorkspaceShellFallback() {
    return (
        <div className="flex h-screen bg-background">
            <aside className="hidden w-64 flex-col gap-4 border-r bg-sidebar md:flex">
                <Skeleton className="ml-4 mt-5 h-7 w-24" />

                <Separator className="bg-border/60" />

                <nav className="flex flex-col gap-2 p-2 pt-0">
                    <div className="space-y-2">
                        {sidebarItems.map((item, index) => {
                            const Icon = item.icon

                            return (
                                <div
                                    key={index}
                                    className={`inline-flex h-7 w-full items-center justify-start gap-2 rounded-md border border-transparent px-2 ${item.active ? "border-primary bg-secondary text-secondary-foreground" : ""
                                        }`}
                                >
                                    <Icon size={16} className="shrink-0 text-muted-foreground/60" />
                                    <Skeleton className={`h-3 ${item.labelWidth}`} />
                                </div>
                            )
                        })}
                    </div>
                </nav>
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
