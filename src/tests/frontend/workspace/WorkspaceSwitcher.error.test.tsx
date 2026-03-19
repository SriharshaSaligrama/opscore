import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { WorkspaceSwitcherView } from "@/features/workspace/components/WorkspaceSwitcherView"
import { ReactNode } from "react"

const refreshMock = vi.fn()
const selectWorkspaceMock = vi.fn()

vi.mock("next/navigation", () => ({
    useRouter: () => ({ refresh: refreshMock }),
}))

vi.mock("@/features/workspace/workspace.actions", () => ({
    selectWorkspace: (id: string) => selectWorkspaceMock(id),
}))

// ✅ mock Radix (CRITICAL)
vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick }: { children: ReactNode, onClick: () => void }) => (
        <button onClick={onClick}>{children}</button>
    ),
}))

describe("WorkspaceSwitcher error state", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("does not refresh on failure", async () => {
        selectWorkspaceMock.mockRejectedValue(new Error("fail"))

        render(
            <WorkspaceSwitcherView
                workspace={{ id: "1", name: "Workspace A" }}
                membershipWorkspaces={[
                    { id: "1", name: "Workspace A" },
                    { id: "2", name: "Workspace B" },
                ]}
            />
        )

        const items = screen.getAllByText("Workspace B")

        fireEvent.click(items[0])

        await waitFor(() => {
            expect(refreshMock).not.toHaveBeenCalled()
        })
    })
})