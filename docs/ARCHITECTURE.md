# Architecture Overview

OpsCore follows a layered architecture:

## Layers

### 1. Repository Layer
Responsible for:
- Direct database access
- Prisma queries only
- No business logic

### 2. Service Layer
Responsible for:
- Business rules
- Permission enforcement
- State machine validation
- Transaction management
- Event logging

### 3. API / Server Actions
Responsible for:
- Request validation
- Calling service layer
- Returning responses

No business logic exists outside the service layer.

---

## Multi-Tenant Isolation

Every entity includes:

- `workspaceId`

All queries must filter by workspaceId derived from authenticated session.

No workspaceId is ever accepted from client input.

---

## RBAC Model

Permissions are hardcoded and mapped to roles.

Roles:

- OWNER
- ADMIN
- MANAGER
- TECHNICIAN
- VIEWER

Permission enforcement happens inside service layer only.

---

## State Machine Enforcement

Work order lifecycle:

OPEN → ASSIGNED → IN_PROGRESS → COMPLETED → CLOSED

Invalid transitions are rejected at service layer.