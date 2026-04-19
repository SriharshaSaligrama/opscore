# Architectural Decisions

## Prisma 6 over Prisma 7

Chosen for:
- Stability
- Avoid query compiler complexity

---

## Soft Deletes

Used for:
- Audit history
- Referential integrity
- Analytics accuracy

Hard deletes avoided.

---

## Static Permissions

Roles and permissions hardcoded to:
- Avoid dynamic complexity
- Reduce attack surface
- Maintain predictability

---

## Session-Based Auth (Not JWT)

Reasons:
- Server-authoritative
- Easier invalidation
- Cleaner multi-tenant context handling

---

## Workspace-Scoped Assets

Assets belong strictly to workspace.
Not user-owned inventory.

Prevents scope creep.

---

## Hashed Invite Tokens

Invite tokens stored hashed to:
- Prevent token leakage risk
- Follow secure token storage best practices

## Integration Testing Strategy

We use real database integration tests with:
- Prisma
- Neon test database
- TRUNCATE beforeEach
- fileParallelism disabled in Vitest v4

Rationale:
- Ensures realistic behavior
- Validates foreign keys and transactions
- Avoids mocking Prisma

Tradeoff:
- Slower than unit tests
- Requires sequential execution

---

## Server Actions Pattern

Actions follow pattern: UI → Service → Prisma

No API routes for internal operations.
Direct server execution via Server Actions.
Strong typing + validation via Zod.

---

## State Machine for Work Orders

Work order status transitions driven by state machine:

```
assign: OPEN → ASSIGNED
start: ASSIGNED → IN_PROGRESS
complete: IN_PROGRESS → COMPLETED
close: COMPLETED → CLOSED
```

Each transition enforces:
- Valid current status
- Role-based permissions

Benefits:
- Predictable workflows
- No invalid state transitions
- Self-documenting business rules