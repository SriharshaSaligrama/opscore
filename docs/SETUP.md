# Local Development Setup

## Requirements

- Node.js LTS (v24+)
- pnpm
- Neon PostgreSQL database

---

## 1. Install Dependencies

pnpm install

---

## 2. Configure Environment Variables

Create `.env`:

DATABASE_URL="your_neon_connection_string"

---

## 3. Generate Prisma Client

pnpm prisma generate

---

## 4. Run Migrations

pnpm prisma migrate dev

---

## 5. Run Development Server

pnpm dev

---

## Useful Commands

pnpm prisma studio
pnpm prisma migrate dev
pnpm prisma generate

---
