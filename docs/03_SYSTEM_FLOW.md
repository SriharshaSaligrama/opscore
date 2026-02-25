# System Flow

## Authentication

Login:
1. Validate credentials.
2. Create session (expires in 7 days).
3. Fetch memberships.
4. Branch:
   - 0 → /no-workspace
   - 1 → auto-set activeWorkspaceId
   - >1 → /select-workspace

Session cookie:
- httpOnly
- SameSite=lax
- maxAge aligned with DB expiry

---

## Workspace Selection

POST /api/workspaces/select

1. Validate membership.
2. Update session.activeWorkspaceId.
3. Redirect to /dashboard.

---

## Authorization Pattern

Every mutation:

1. Read session.
2. Ensure membership.
3. Ensure permission.
4. Execute DB operation.

Reads:
- Membership validation only.

---

## Invite Flow (Planned)

1. Create invite (role + expiry).
2. Generate token.
3. Hash token before storing.
4. Accept invite → create membership.
5. Invalidate token.