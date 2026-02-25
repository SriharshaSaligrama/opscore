# Architecture Overview

OpsCore follows a layered architecture.

---

## Layers

### 1. Service Layer

Responsible for:
- Business rules
- Permission enforcement
- Transaction management
- State machine validation
- Domain invariants

No Prisma queries exist outside service layer.

---

### 2. API / Server Actions

Responsible for:
- Input validation
- Calling services
- Returning response
- Setting cookies
- Redirect handling

No business logic here.

---

## Multi-Tenant Isolation

Every entity includes:
- workspaceId

Rules:
- workspaceId always derived from session.
- Never accepted from client.
- Every query filtered by workspaceId.

---

## RBAC Model

Roles:
- OWNER
- ADMIN
- MANAGER
- TECHNICIAN
- VIEWER

Permissions are hardcoded and mapped in code.

Permission checks exist only inside service layer.

---

## State Machine Enforcement

WorkOrder transitions validated in service layer.

Invalid transitions rejected.

---

## Architectural Simplification

Repository layer intentionally removed to:
- Reduce indirection
- Improve clarity
- Focus on domain modeling