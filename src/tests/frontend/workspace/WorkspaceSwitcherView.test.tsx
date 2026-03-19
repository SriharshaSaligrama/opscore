import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { WorkspaceSwitcherView } from "@/features/workspace/components/WorkspaceSwitcherView"
import { ReactNode } from "react"

// ✅ mocks
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

describe("WorkspaceSwitcherView", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("switches workspace", async () => {
        render(
            <WorkspaceSwitcherView
                workspace={{ id: "1", name: "Workspace A" }}
                membershipWorkspaces={[
                    { id: "1", name: "Workspace A" },
                    { id: "2", name: "Workspace B" },
                ]}
            />
        )

        // ⚠️ multiple elements → use ALL
        const items = screen.getAllByText("Workspace B")

        fireEvent.click(items[0])

        await waitFor(() => {
            expect(selectWorkspaceMock).toHaveBeenCalledWith("2")
            expect(refreshMock).toHaveBeenCalled()
        })
    })

    it("handles async switching (transition)", async () => {
        selectWorkspaceMock.mockImplementation(
            () => new Promise((res) => setTimeout(res, 100))
        )

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

        // ✅ ensure async started
        await waitFor(() => {
            expect(selectWorkspaceMock).toHaveBeenCalledWith("2")
        })
    })
})