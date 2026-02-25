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