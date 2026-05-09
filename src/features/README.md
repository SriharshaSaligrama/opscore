# Feature Scaffold Contract

Use this structure for every new product feature so modules scale consistently.

```txt
src/features/<feature>/
  <feature>.schemas.ts      # zod inputs, name constants, exported input types
  <feature>.repository.ts   # DB reads/writes, accepts db: DB = prisma
  <feature>.queries.ts      # page/dashboard reads; no mutations
  <feature>.service.ts      # business mutations and transactional rules
  <feature>.cache.ts        # feature-level invalidation helpers
  actions/                  # server actions using shared action wrappers
  components/               # client/server UI for this feature
```

Feature checklist:

- Add permissions/capabilities before exposing UI controls.
- Put all user-facing input contracts in `*.schemas.ts`.
- Keep page reads in `*.queries.ts`; keep mutations in `*.service.ts`.
- Use repositories for Prisma access and accept an optional transaction `db`.
- Use `runWorkspaceMutation` or `runWorkspaceMutationWithContext` for mutations.
- Return `domainEvents.*(...)` from mutation `event` callbacks instead of recording manually.
- Use feature cache helpers instead of raw `revalidatePath` in actions.
- Use `ActionForm`, `ActionDialogForm`, `ConfirmActionDialog`, `CollectionContentShell`, and `DataTableShell` before creating feature-specific form/list shells.
- Add focused tests for schema limits, permission behavior, transactional mutation behavior, and domain event metadata.
