# Architectural Decisions

## Why Prisma 6 Instead of 7

Prisma 6 is used for stability and maturity.
Prisma 7 introduces a query compiler that adds unnecessary complexity for this project stage.

---

## Why Soft Deletes

Entities use `isDeleted` flag to preserve:

- Audit history
- Referential integrity
- Analytics correctness

Hard deletes are avoided.

---

## Why Hardcoded Permissions

Roles and permissions are defined in code to:

- Avoid dynamic role complexity
- Ensure predictability
- Reduce attack surface

Dynamic permissions can be introduced in v2.

---

## Why Repository + Service Separation

- Prevents business logic in controllers
- Encourages testability
- Makes architecture scalable
- Mimics production-grade backend systems