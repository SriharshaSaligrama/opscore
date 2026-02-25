# Data Model

## Core Tables

Workspace
- id (PK)
- name
- createdAt

User
- id (PK)
- email (unique)
- passwordHash
- name

Membership
- id
- userId (FK)
- workspaceId (FK)
- role
- unique(userId, workspaceId)

Session
- id
- userId (FK)
- activeWorkspaceId (nullable FK)
- expiresAt
- indexed(userId)

Asset
- id
- workspaceId (FK)
- categoryId (FK)
- name
- status
- isDeleted
- indexed(workspaceId)

AssetCategory
- id
- workspaceId (FK)
- name
- unique(workspaceId, name)

WorkOrder
- id
- workspaceId (FK)
- assetId (FK)
- assignedTo (FK)
- status
- isDeleted
- indexed(workspaceId, status)