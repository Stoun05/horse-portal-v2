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

## Phase 4: initial authenticated sync endpoint
`POST /api/sync/horses` requires a valid staff session. Transactional apply checks user role, record version and a durable change ID; only accepted changes should be acknowledged by clients. This is a preliminary endpoint, **not production ready**: no real PostgreSQL integration test yet, no offline authorization grants, no rate limiting, no LAN TLS, no multiuser cache isolation, no conflict resolution UI, and no safe online migration of previous browser localStorage records. An authorized user might have offline edits rejected when a role is revoked. The desktop application has not been wired to this endpoint.

## Phase 5: opt-in Electron IPC adapter
`electron/offline-ipc.cjs` and `electron/offline-preload.cjs` define three read-only channels (status, horses, pending count) and reject senders outside the designated loopback main frame. They are deliberately **not loaded by electron/main.cjs**: local cache data is not yet scoped to authenticated users or encrypted, and exposing it to a renderer would leak records. Once account isolation, authorization and secure storage are implemented and tested, wire main/preload to this adapter. No renderer write or arbitrary SQL IPC is provided.

## Phase 6: offline permission verification contract
`electron/offline-access.cjs` verifies short-lived Ed25519 signed permission grants using a public key; the private signing key must remain on the server. Expired, mismatched and tampered grants fail closed. This is not enabled yet: server issuance, public-key rotation, per-user encrypted storage, revocation policy and offline login remain required. Signed grants cannot immediately reflect revocation while disconnected; server must recheck permissions at synchronization.

## Phase 7: prototype encrypted account vault
`electron/offline-vault.cjs` provides AES-256-GCM authenticated encryption for a JSON object stored in a deterministic hashed account folder, with write-then-rename and isolated vaults. Tests check persistence, ciphertext tampering, and wrong-key rejection. **This is a prototype only.** The existing SQLite offline cache and outbox are still plaintext and not integrated with this vault. Key generation, OS-protected key storage, key rotation, backup/recovery, secure login and user-specific filtering are not implemented. Do not activate the offline cache for sensitive production data yet.

## Phase 8: Windows-protected key adapter
`electron/offline-key-store.cjs` adds opt-in per-account AES key wrapping with Electron safeStorage, refusing unsupported Windows encryption and overwrites. Tests use a mock adapter only; actual Windows DPAPI, multiuser OS profiles, file ACLs, backup/key recovery, process isolation, and migration from plaintext SQLite have **not** been tested. The key adapter and encrypted JSON vault are not connected to the active local SQLite store or Electron window.

## Phase 9: account-scoped encrypted outbox prototype
`electron/account-offline-store.cjs` builds on the AES-GCM JSON vault, storing per-account horse snapshots and pending mutations atomically through encrypted file replacement. The test exercises persistence across reopening, account separation and acknowledgment. This is **not** yet wired into the Electron runtime, server API or the original SQLite cache. Multi-process locking, durable fsync, operation ordering/conflicts, recovery and migration must be solved before production. The standalone SQLite prototype remains unencrypted and must not be used for sensitive data.

## Phase 10: explicit encrypted backups
`electron/offline-backup.cjs` exports the existing encrypted envelope only after confirming it decrypts with the supplied account key. Restoring refuses to overwrite an existing vault. Unit tests cover round-trip and wrong-key errors. Manual backup only: no scheduler, retention, access control to backup directories, Windows recovery key escrow, fsync or disaster-recovery procedures. Not wired to Electron and not production-ready.

## Phase 11: guarded encrypted store prototype
`electron/authorized-offline-store.cjs` gates the encrypted account store behind a verified short-lived offline grant. Read-only grants cannot create edits. This is not a complete authentication mechanism: no local human authentication, signed grant issuance, persisted secure grant, complete permission scope, or connection to the UI. Do not deploy until these constraints and real Windows integration are tested.

## Phase 12: server-issued offline grant function
`server/src/offline-grants.mjs` can sign up-to-15-minute, role-derived Ed25519 grants. The private key is supplied at runtime. Server key provisioning and protected storage, issuance via authenticated HTTP, revocation model, client key trust, device binding, account login, and Windows acceptance are not complete; therefore this functionality is not active or production-ready.
