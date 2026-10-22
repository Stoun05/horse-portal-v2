# Offline-first implementation plan (draft)

Scope: Windows Electron client only. Browser users remain server-backed.

## Architecture
- PostgreSQL remains authoritative for accepted shared data.
- Electron main process owns a per-PC SQLite cache and durable outbox.
- Renderer will communicate through a narrowly scoped, context-isolated preload API (not yet implemented).
- Each write must update cache and outbox together in one transaction.
- Outbox changes remain pending until a server ACK confirms the write.
- Every mutation carries a stable change ID (idempotency key) and a base server version; backend will reject stale writes as conflicts.
- Client must not silently discard conflicts and must not claim that local writes reached the server.
- Offline permissions require signed, short-lived authorization grants or a comparable verified policy. Server must always recheck all privileges upon sync.
- Encrypt at-rest cached sensitive data and scope local caches by user account before deployment.
- On reconnect: authenticate, refresh permissions, upload changes in order, reconcile conflicts, fetch server updates, and record last successful sync time.
- First milestone is persistence and outbox integrity only. Not connected to renderer or network and not ready for production.

## Current limitations
SQLite module uses the Node built-in `node:sqlite` API; compatibility with the Electron runtime and Windows packaging must be validated. Current code is a scaffold and unit-test target, not deployed storage. Existing localStorage remains unchanged. No offline authorization, multi-user separation, data migration, upload or recovery workflow is implemented yet.

## Phase 2: pure synchronization planner
`electron/sync-planner.cjs` validates queued changes, retains ordering and classifies server replies as acknowledged, conflict, forbidden or retry. This module does **not** send requests or delete pending operations. It cannot synchronize without authenticated server sync endpoints, user isolation and resolution of version conflicts. The Windows test workflow runs its tests.

## Phase 3: server-side versioning foundations
Migration 005 adds horse version and a durable sync operation ledger. `server/src/sync-validation.mjs` verifies change identifiers, base versions and role permissions. No authenticated sync mutation endpoint or transactional apply operation is wired yet. Acknowledgments require server-side authorization, idempotent transaction handling and conflict detection; never upload cached records directly without those checks.
