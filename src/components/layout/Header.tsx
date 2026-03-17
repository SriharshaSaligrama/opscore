import WorkspaceSwitcher from "@/features/workspace/components/WorkspaceSwitcher"
import { getWorkspaceContext } from "@/features/workspace/workspace.context"

import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeSwitcher } from "@/components/ui/theme-switch"

export default async function Header() {
    const { user, workspace, membershipWorkspaces } = await getWorkspaceContext()

    return (
        <header className="h-16 border-b bg-background flex items-center justify-between  px-6">
            {/* Workspace Switcher */}
            <WorkspaceSwitcher
                workspace={workspace}
                membershipWorkspaces={membershipWorkspaces}
            />

            {/* User Menu */}
            <div className="flex items-center gap-4">
                <ThemeSwitcher />
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Avatar className="cursor-pointer">
                            <AvatarFallback>
                                {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}