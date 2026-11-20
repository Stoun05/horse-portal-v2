# Admin login — deployment configuration

The admin pages use signed HTTP-only session cookies and a single shared administrator access code. No email is requested. Environment variables are server-only (no NEXT_PUBLIC_ prefix).

Required for each Vercel project that deploys this branch:
- ADMIN_ACCESS_CODE — strong random single-admin access code (at least 16 characters).
- ADMIN_SESSION_SECRET — random string at least 32 characters, unique per deployment environment.

Do not commit values to GitHub. Configure variables in Vercel Project Settings > Environment Variables and redeploy the branch.

The login endpoint returns 503 if either required variable is missing or too short. The Next.js proxy redirects unauthenticated /admin routes to /admin/login and returns HTTP 401 for protected /api/admin routes.
The session expires after 8 hours. Changing ADMIN_SESSION_SECRET invalidates existing cookies. Changing only ADMIN_ACCESS_CODE does NOT revoke existing cookies; rotate ADMIN_SESSION_SECRET when revoking sessions.

IMPORTANT: This is a first stage for a **single admin**, not a complete multi-user RBAC solution. The rest of the portal still uses localStorage, and pages outside /admin (such as /media or /saglyk) may still contain write controls. Those must be migrated to protected server endpoints. Rate limiting for login attempts should be enabled before public production use. The current implementation has no login-attempt rate limiting, no centralized user store, and does not secure existing non-admin write paths.

For the Electron static export, set ATCYLYK_STATIC_EXPORT=1 during next build. In static export mode Next.js route handlers and proxy authentication do not exist. Do not expose sensitive admin operations through the static app.
