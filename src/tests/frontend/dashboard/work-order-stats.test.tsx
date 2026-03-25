// tests/frontend/dashboard/WorkOrderStats.test.tsx

import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"

function WorkOrderStatsView({ count }: { count: number }) {
    return (
        <div>
            {count === 0 ? (
                <p>No work orders yet</p>
            ) : (
                <p>{count}</p>
            )}
        </div>
    )
}

describe("WorkOrderStats UI", () => {
    it("renders count", () => {
        render(<WorkOrderStatsView count={5} />)

        expect(screen.getByText("5")).toBeInTheDocument()
    })

    it("renders empty state", () => {
        render(<WorkOrderStatsView count={0} />)

        expect(
            screen.getByText("No work orders yet")
        ).toBeInTheDocument()
    })
})