## About OpsCore

OpsCore is a production-grade multi-tenant operations management platform built as an engineering showcase.

The project focuses on demonstrating real-world backend architecture and software engineering discipline rather than UI complexity.

Core engineering principles implemented:

- Strict layered architecture (Repository → Service → API)
- Multi-tenant isolation with workspace-based scoping
- Role-Based Access Control (RBAC)
- State machine–driven lifecycle enforcement
- Immutable event logging
- Soft delete strategy
- Aggregated analytics with optimized queries
- Structured logging and centralized error handling
- CI-driven development workflow

This project is intentionally designed to reflect production system design practices rather than tutorial-style CRUD implementation.

---

## 🚀 Tech Stack

- Next.js (App Router)
- TypeScript (strict mode)
- PostgreSQL (Neon)
- Prisma ORM
- pnpm
- Pino (logging)
- Vitest (testing)

---

## 🏗 Architecture Principles

- Repository Layer → database access only
- Service Layer → business logic
- API / Server Actions → thin transport layer
- Strict workspace isolation
- Explicit permission enforcement
- Soft deletion strategy
- Immutable event logging

---

## 📂 Project Structure
src/
app/
features/
lib/
tests/
docs/
prisma/


---

## ⚙️ Local Setup

See: `docs/SETUP.md`

---

## 📐 Architecture Documentation

See: `docs/ARCHITECTURE.md`

---

## 📜 Engineering Decisions

See: `docs/DECISIONS.md`