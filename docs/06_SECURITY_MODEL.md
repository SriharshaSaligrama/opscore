# Security Model

## Authentication

- DB-backed sessions.
- SessionId stored in httpOnly cookie.
- Expiry enforced server-side.

---

## Tenant Isolation

- workspaceId derived from session.
- Never trusted from client.
- Membership validated before all operations.

---

## Authorization

- Centralized AuthorizationService.
- Permission matrix.
- Role hierarchy enforcement.
- Prevent removing last OWNER.

---

## Workspace Ownership & Role Hierarchy Model

OpsCore follows a **multi-owner workspace model** to ensure operational continuity and prevent single points of failure.

### Ownership Rules

- A workspace may have multiple users with the OWNER role.
- At least one OWNER must always remain.
- The last remaining OWNER cannot be removed.
- The last remaining OWNER cannot be demoted.

### Role Hierarchy

OWNER > ADMIN > MANAGER > TECHNICIAN > VIEWER

### Hierarchy Enforcement Rules

- Users cannot manage members with higher roles.
- Users cannot manage members with equal roles.
- Exception: OWNERs may manage other OWNERs.

This exception exists to support shared ownership and business continuity.

### Safety Guarantees

These rules prevent:
- Privilege escalation attacks
- Accidental workspace lockouts
- Unauthorized role manipulation

---

## CSRF Protection

SameSite=lax cookie policy.
POST-only mutations.

Future improvement:
- CSRF token enforcement.

---

## XSS Protection

- No raw HTML rendering.
- React escapes by default.
- No dangerouslySetInnerHTML.

---

## Invite Token Security

- Tokens hashed before DB storage.
- One-time use.
- Expiry enforced.