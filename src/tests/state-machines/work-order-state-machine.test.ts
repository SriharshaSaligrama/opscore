import { describe, it, expect } from "vitest"
import { executeTransition } from "@/features/work-order/work-order.state-machine"
import { ForbiddenError } from "@/lib/errors"

describe("Work Order State Machine", () => {
    it("allows valid transitions", () => {
        expect(executeTransition("assign", "OPEN", "ADMIN")).toBe("ASSIGNED")
        expect(executeTransition("start", "ASSIGNED", "TECHNICIAN")).toBe("IN_PROGRESS")
        expect(executeTransition("complete", "IN_PROGRESS", "TECHNICIAN")).toBe("COMPLETED")
        expect(executeTransition("close", "COMPLETED", "ADMIN")).toBe("CLOSED")
    })

    it("blocks invalid transitions", () => {
        expect(() => executeTransition("complete", "OPEN", "ADMIN"))
            .toThrow(ForbiddenError)
    })

    it("enforces role restrictions", () => {
        expect(() => executeTransition("assign", "OPEN", "VIEWER"))
            .toThrow(ForbiddenError)
    })
})