# OpsCore – System Overview

## What Is OpsCore?

OpsCore is a multi-tenant internal maintenance and work order platform.

It enables organizations (workspaces) to:

- Manage operational assets
- Create and track work orders
- Assign tasks to technicians
- Enforce structured workflows
- Control access through RBAC

This project is designed as an engineering showcase focusing on:

- Multi-tenant architecture
- Secure session handling
- Strict RBAC enforcement
- Clean service-layer design
- Scalable backend modeling

---

## Core Principles

- Tenant isolation is absolute.
- All operations are scoped by workspace.
- Business logic exists only in service layer.
- Permission enforcement is centralized.
- Soft deletes preserve operational history.
- Roles are contextual to workspace (via Membership).

---

## High-Level Structure

Workspace
 ├── Membership (User + Role)
 ├── Asset
 │     └── WorkOrder
 └── WorkOrder