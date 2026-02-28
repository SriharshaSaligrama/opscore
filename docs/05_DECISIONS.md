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