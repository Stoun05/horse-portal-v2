# Admin login — deployment configuration

The admin pages use signed HTTP-only session cookies and a single shared administrator access code. No email is requested. Environment variables are server-only (no NEXT_PUBLIC_ prefix).

Required for each Vercel project that deploys this branch:
- ADMIN_ACCESS_CODE — strong random single-admin access code (at least 16 characters).
- ADMIN_SESSION_SECRET — random string at least 32 characters, unique per deployment environment.

Do not commit values to GitHub. Configure variables in Vercel Project Settings > Environment Variables and redeploy the branch.

The login endpoint returns HTTP 503 if ADMIN_ACCESS_CODE, ADMIN_SESSION_SECRET, or the Redis REST variables are missing or invalid. Redis is REQUIRED for login, so server-side login attempts can be throttled. The Next.js proxy redirects unauthenticated /admin routes to /admin/login and returns HTTP 401 for protected /api/admin routes.
The session expires after 8 hours. Changing ADMIN_SESSION_SECRET invalidates existing cookies. Changing only ADMIN_ACCESS_CODE does NOT revoke existing cookies; rotate ADMIN_SESSION_SECRET when revoking sessions.

IMPORTANT: This is a first stage for a **single admin**, not a complete multi-user RBAC solution. The rest of the portal still uses localStorage, and pages outside /admin (such as /media or /saglyk) may still contain write controls. Those must be migrated to protected server endpoints. Redis-backed login throttling is implemented, but deployment and integration tests are still required. There is no centralized multi-user store, and existing non-admin write paths remain unprotected.

For the Electron static export, set ATCYLYK_STATIC_EXPORT=1 during next build. In static export mode Next.js route handlers and proxy authentication do not exist. Do not expose sensitive admin operations through the static app.

## Changing the admin code from Settings

The Admin Panel > Sazlamalar screen now contains a change-code form. This feature requires a durable Upstash Redis-compatible REST database. Login also requires this database for its server-side attempt limiter.

Required additional **server-only** variables:
- UPSTASH_REDIS_REST_URL — Redis REST endpoint.
- UPSTASH_REDIS_REST_TOKEN — Redis REST authentication token.

Configure the same Redis database on every deployment that is intended to share a code. Do not expose these values to browser JavaScript or GitHub.

On the first change, the existing ADMIN_ACCESS_CODE is validated and a salted scrypt hash is persisted in Redis. Future logins use the stored hash. Subsequent code changes require the current code. The operation uses atomic compare-and-swap to avoid concurrent lost updates.

Each successful change increments the credential version, clears the current cookie and invalidates existing signed sessions via the Next.js proxy. Keep ADMIN_SESSION_SECRET stable during normal changes. Redis outages fail closed while configured.

The bootstrap environment ADMIN_ACCESS_CODE remains configured as a recovery baseline but is *not* accepted after a stored hash exists. Changing or removing the Redis database can revert to bootstrap credentials; restrict administrative access to Redis and project settings. Login attempts are limited to 8 requests per 15 minutes per client IP using Redis. When Redis is not configured or reachable, login is rejected with HTTP 503 (fail closed). The per-IP limiter uses proxy-provided IP headers; configure trusted proxy IP handling and add edge protection to avoid spoofed-header bypasses. Sensitive admin POST endpoints also check Origin / Fetch Metadata against the site. Production deployment still needs server-protected writes outside /admin.

## GitHub Actions

The `Admin Panel CI` workflow on `feature/admin-panel` runs `npm ci` and `npm run build` in GitHub Actions. This tests compilation only; it is not hosting and does not test live credentials, Redis connectivity, or browser interaction. GitHub Pages static export cannot execute the server login endpoints.

## Shared horse catalog (incremental rollout)

- GET /api/horses reads the shared horse list from Redis.
- POST /api/admin/horses requires a signed admin session and supports upsert/delete with revision conflict checking (HTTP 409).
- When the Redis catalog is empty, the original 24 built-in horses are returned until the first edit persists the record.
- Existing browser-local custom horses are NOT migrated automatically. Back them up before moving to the shared database.
- Without Redis, the catalog continues in READ-ONLY local demonstration mode. Admin add/edit/delete buttons are hidden until the shared database is reachable. Existing browser-local records can still be displayed, but are not synchronized.
- Uploaded images currently use browser data URLs; move photos to object storage before production.
- User accounts and other editing routes are not migrated yet.
