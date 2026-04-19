# Domain Model

## Workspace

Represents an organization.

- Defines tenant boundary.
- Owns all data.
- Must always have at least one OWNER.

---

## User

Global identity.

- Authenticates via email/password.
- May belong to multiple workspaces.
- Role is defined per workspace via Membership.

---

## Membership

Defines User ↔ Workspace relationship.

Fields:
- userId
- workspaceId
- role

Purpose:
- Enables contextual RBAC.
- Supports multi-tenant architecture.

---

## Asset

Represents a maintainable entity.

Ownership:
- Belongs strictly to a workspace.
- NOT owned by individual users.

Fields:
- name
- categoryId
- workspaceId
- status
- createdBy
- isDeleted

Soft delete enforced.

---

## AssetCategory

Defines classification of assets.

- Belongs to workspace.
- Not shared across tenants.
- Customizable per workspace.

---

## WorkOrder

Represents an operational task.

Fields:
- assetId
- workspaceId
- assignedTo
- status
- priority
- description
- createdBy
- isDeleted

Lifecycle:
OPEN → ASSIGNED → IN_PROGRESS → COMPLETED → CLOSED

Actions:
- assign: OWNER, ADMIN, MANAGER can assign to technician
- start: TECHNICIAN can start work
- complete: TECHNICIAN can complete work
- close: OWNER, ADMIN can close work order

Soft delete enforced (isDeleted).