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

import { WorkspacePromise } from "@/features/workspace/workspace.types"

export async function UserDropdown({ workspacePromise }: { workspacePromise: WorkspacePromise }) {
    const { user } = await workspacePromise

    return (<DropdownMenu>
        <DropdownMenuTrigger>
            <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary/30 transition">
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
    </DropdownMenu>)
}