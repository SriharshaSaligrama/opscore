# OpsCore – Week 1 Architecture Summary

## Overview

Week 1 establishes the foundation of OpsCore:

- Authentication (Session-based)
- Multi-tenant workspace model
- Active workspace context
- RBAC (Role-Based Access Control)
- Authorization layer
- Guard-based route protection
- Clean service-layer architecture
- No repository abstraction (intentionally simplified)

##

# Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth Strategy**: Session-based (DB-backed)
- **Language**: TypeScript
- **Validation**: Zod
- **Error Handling**: Centralized via `withErrorHandler`

##
# High-Level Architecture

```
Route (API / Server Component)
↓
Service Layer
↓
AuthorizationService (when needed)
↓
Prisma
↓
Database
```

No repository layer (removed intentionally for clarity and velocity).

##

# Authentication Design

## Session Model

```ts
Session {
  id: string
  userId: string
  expiresAt: Date
  activeWorkspaceId: string | null
}
```

### Decisions:
- Session stored in DB.
- Cookie stores only `sessionId`.
- Cookie uses `httpOnly`, `sameSite=lax`, `secure` in production.
- maxAge = 7 days` aligned with DB expiry.
- Session expiration enforced in backend.

##

Auth Flow
=========

Signup
------
1. Create user. 
2. Create workspace.   
3. Create membership (OWNER).
4. Return session.

Login
-----
1. Validate credentials.  
2. Create session with `activeWorkspaceId = null`.
3. Fetch memberships.
4. Branch:
    

| Membership Count | Behavior                       |
| ---------------- | ------------------------------ |
| 0                | Redirect → `/no-workspace`     |
| 1                | Auto-set activeWorkspaceId     |
| >1               | Redirect → `/select-workspace` |

##
Workspace Context
=================

Rule:
-----

Workspace context must ALWAYS come from session.

Never from:
- request body
- query params
- localStorage 

This prevents tenant boundary violations.

Workspace Selection Flow
========================

### POST `/api/workspaces/select`
- Reads `workspaceId` from formData.  
- Validates membership.    
- Updates session.activeWorkspaceId.   
- Redirects to `/dashboard`.

No GET endpoint for selection.
##
Guards
======

AuthGuard
---------

Ensures:
- Session exists  
- Not expired

WorkspaceGuard
--------------

Ensures:
- Session exists  
- activeWorkspaceId exists  
- Membership is still valid

Wrapped in `<Suspense>` to prevent blocking-route errors.
##
Multi-Tenant Isolation Rule
===========================

All feature services must:
1.  Read `workspaceId` from session.
2.  Validate membership via AuthorizationService.
3.  Never trust client-provided workspaceId.
    
##
Authorization System
====================

Roles
-----
- OWNER
- ADMIN 
- MANAGER 
- TECHNICIAN  
- VIEWER
    
##
Permission Matrix (Static, In Code)
-----------------------------------

Permissions defined in:

```features/authorization/permissions.ts```

Example:

```
Permission.CREATE_ASSET
Permission.UPDATE_ASSET
Permission.MANAGE_USERS
```

Mapped via:

```RolePermissions: Record<Role, Permission[]>```
##
AuthorizationService
--------------------

Provides:
- ```ensureMembership(userId, workspaceId)```  
- ```ensurePermission(membership, permission)```
    

Returns sanitized membership object.

Throws domain errors on violation.
##
Role Hierarchy
==============

Defined as:

```
OWNER      = 5
ADMIN      = 4
MANAGER    = 3
TECHNICIAN = 2
VIEWER     = 1
```

Used to prevent:
- Modifying equal or higher roles  
- Removing last OWNER
    
##
Critical Invariant
==================

For every workspace:

```COUNT(role = OWNER) >= 1```

Enforced in service layer inside transaction.
##
Deletion Strategy
=================
- Work orders are not hard-deleted.   
- Prefer status transitions or archival.  
- Domain integrity over physical deletion.
    
##
Folder Structure
================
```
src/
  app/
    api/
    (protected)/
    layout.tsx
  features/
    auth/
    workspace/
    authorization/
  lib/
    prisma.ts
    auth.ts
    errors.ts
    api-handler.ts
prisma/
docs/
```
##
Security Decisions
==================
- No workspaceId from client.
- No localStorage for tenant context.
- Cookie is httpOnly.
- Session expiry enforced server-side.
- Authorization centralized.
- Role checks only for mutation operations.
    
##
Removed Architecture
====================

Repository layer removed intentionally.

Reason:
- Reduced unnecessary abstraction.
- Improved clarity.
- Focus on domain modeling & RBAC.
- Appropriate for current project scale.
    
##
Week 1 Outcome
==============

By end of Week 1:
- Auth fully functional.
- Multi-workspace login branching complete.
- Workspace selection flow complete.
- Guards stable (no redirect loops).
- Blocking-route error resolved.
- RBAC foundation established.
- Clean service-based architecture.

##
## Week 1 Completion Status

Implemented:
- AuthService
- WorkspaceService
- AuthorizationService
- Integration test infrastructure
- Database isolation strategy
- Sequential test execution

All tests passing.

## Testing Strategy

Testing approach:

- Integration tests using real PostgreSQL (Neon test DB).
- No mocking of Prisma.
- Database truncated before each test.
- Sequential execution enforced to prevent deadlocks.

Why:
RBAC, foreign keys, and session logic rely on real database constraints.
Mocking would not validate domain integrity.