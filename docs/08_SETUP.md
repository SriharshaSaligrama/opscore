# Local Development Setup

## Requirements

- Node.js LTS (v24+)
- pnpm
- Neon PostgreSQL database

---

## 1. Install Dependencies

```pnpm install```

---

## 2. Configure Environment Variables

Create `.env`:

```DATABASE_URL="your_neon_connection_string"```

---

## 3. Generate Prisma Client

```pnpm prisma generate```

---

## 4. Run Migrations

```pnpm prisma migrate dev```

---

## 5. Run Development Server

```pnpm dev```

---

## Useful Commands
```
pnpm prisma studio
pnpm prisma migrate dev
pnpm prisma generate
```
---

## Testing Environment

- `NODE_ENV=test` is strictly enforced.
- `DATABASE_URL` must point to the test database.
- `setup.ts` truncates all tables before each test using `TRUNCATE ... CASCADE`.
- Vitest configured with:
  - `fileParallelism: false`
  - `maxWorkers: 1`

Reason:
Integration tests use a real PostgreSQL database.  
Parallel execution can cause deadlocks during TRUNCATE and FK operations.