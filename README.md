# OpsCore

OpsCore is a production-style multi-tenant operations management platform built as an engineering showcase.

This project focuses on backend architecture, multi-tenant system design, RBAC enforcement, and disciplined service-layer architecture rather than UI complexity.

---

# 🎯 Purpose

OpsCore is designed to demonstrate:

- Multi-tenant architecture with strict workspace isolation
- Role-Based Access Control (RBAC)
- Session-based authentication (server authoritative)
- Service-layer business logic enforcement
- State machine–driven lifecycle validation
- Soft deletion strategy
- Secure invite-token design (planned)
- Production-grade documentation discipline

This project prioritizes architectural clarity over rapid feature sprawl.

---

# 🏗 Architecture Principles

- Service Layer → All business logic lives here
- API / Server Actions → Thin transport layer only
- No business logic in controllers
- Workspace-scoped data isolation
- Centralized authorization enforcement
- Static permission matrix
- Soft deletion (`isDeleted`) for audit safety
- Session-based authentication (no JWT)

Repository layer intentionally removed to reduce unnecessary abstraction at current scale.

---

# 🔐 Multi-Tenancy Model

- Every entity belongs to a `workspaceId`
- Workspace context derived only from authenticated session
- No workspaceId accepted from client input
- Membership validation enforced before every operation

Tenant isolation is guaranteed at service layer.

---

# 👥 RBAC Model

Roles:

- OWNER
- ADMIN
- MANAGER
- TECHNICIAN
- VIEWER

Permissions are statically mapped in code.
All permission checks are enforced in service layer only.

---

# 📦 Domain Scope

Current implemented foundation:

- Authentication
- Workspace creation & selection
- Membership-based RBAC foundation
- Guard-based route protection

Planned modules:

- Asset management (workspace-scoped)
- Work order lifecycle management
- Invite-based user onboarding
- Structured logging
- Analytics aggregation

---

# 🚀 Tech Stack

- Next.js (App Router)
- TypeScript (strict mode)
- PostgreSQL (Neon)
- Prisma ORM (v6)
- pnpm
- Zod (validation)

Testing & observability layers will be introduced in subsequent phases.

---

# 📂 Project Structure

```
opscore/
├── prisma/
│ ├── schema.prisma
│ └── migrations/
│
├── src/
│ ├── app/ # Next.js App Router
│ ├── features/ # Domain-based modules
│ ├── lib/ # Shared utilities
│ └── tests/ # Testing (planned expansion)
│
├── docs/ # Architecture & design documentation
├── package.json
└── README.md
```

---

# 📚 Documentation

Core system documentation lives in `/docs`:

- `01_SYSTEM_OVERVIEW.md`
- `02_DOMAIN_MODEL.md`
- `03_SYSTEM_FLOW.md`
- `04_ARCHITECTURE.md`
- `05_DECISIONS.md`
- `06_SECURITY_MODEL.md`
- `07_DATA_MODEL.md`

---

# ⚙️ Local Setup

See: `docs/08_SETUP.md`

---

# 📈 Roadmap

Phase 1 – Foundation (Completed)
- Auth
- Workspace selection
- RBAC structure
- Session model

Phase 2 – Core Domain
- Asset module
- Work order module
- Invite-based membership flow

Phase 3 – Engineering Depth
- Full test coverage
- Logging & observability
- Performance optimization
- CI/CD pipeline
- Deployment hardening

---

# 🧠 Why This Project Exists

OpsCore is intentionally built to reflect production backend discipline:

- Clear domain modeling
- Explicit security boundaries
- Controlled feature scope
- Strong documentation culture
- Incremental architectural growth

This is not a tutorial project.
It is an evolving engineering system.