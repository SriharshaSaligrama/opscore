import WorkspaceSwitcher from "@/features/workspace/components/WorkspaceSwitcher"
import { getWorkspaceContext } from "@/features/workspace/workspace.context"

import { ThemeSwitcher } from "@/components/ui/theme-switch"
import { UserDropdown } from "@/features/auth/components/UserDropdown"
import { Suspense } from "react"
import WorkspaceSwitcherSkeleton from "@/features/workspace/components/WorkspaceSwitcherSkeleton"
import UserMenuSkeleton from "@/features/auth/components/UserDropdownSkeleton"

export default async function Header() {
    const workspacePromise = getWorkspaceContext()

    return (
        <header className="h-16 border-b bg-background flex items-center justify-between  px-6">
            {/* Workspace Switcher */}
            <Suspense fallback={<WorkspaceSwitcherSkeleton />}>
                <WorkspaceSwitcher
                    workspacePromise={workspacePromise}
                />
            </Suspense>

            {/* User Menu */}
            <div className="flex items-center gap-4">
                <ThemeSwitcher />
                <Suspense fallback={<UserMenuSkeleton />}>
                    <UserDropdown
                        workspacePromise={workspacePromise}
                    />
                </Suspense>
            </div>
        </header>
    )
}