# Atçylyk Portal — local backend (phase 1)

Independent PostgreSQL-backed server scaffold. No UI, Electron, or existing localStorage behavior is modified.

## Requirements
- Node.js 22+ (compatible current Node LTS recommended)
- PostgreSQL on academy LAN server
- A database and restricted application database user

## Setup
1. `cd server`
2. `npm install`
3. Copy `.env.example` to `.env`; set an appropriately strong DATABASE_URL password.
4. `npm run db:init`
5. `npm start`
6. Check `http://127.0.0.1:4100/health` and `http://127.0.0.1:4100/ready`.

After database initialization, use `GET /api/horses?limit=50` with header `Authorization: Bearer <API_TOKEN>` for a protected read-only horse list. This temporary shared token is for development tests, not a replacement for named user accounts and role permissions. The table is empty until a reviewed data migration is performed.\n\nThe server initially binds to localhost (HOST=127.0.0.1). Binding to HOST=0.0.0.0 enables LAN listening **only once** authentication, authorization, firewall restrictions, backup policy, and TLS or equivalent network protection are in place. Do not open this service to the public internet.

Schema currently contains tables for horses, users and audit events, plus indexed horse code and basic horse fields. These are preparation, not active persistence; the UI still uses browser localStorage. Authentication and protected CRUD routes are not implemented in phase 1.

Never commit `.env`, passwords, medical histories, real user records, or database dumps.

## Login foundation (not production ready)
Migration 003 adds hashed, expiring sessions. Endpoints: POST `/api/auth/login` with `{username,password}`, GET `/api/auth/me` and POST `/api/auth/logout` with `Authorization: Bearer <session token>`. No initial admin account is provisioned, so login cannot work until secure account provisioning is implemented. The old `/api/horses` endpoint still uses a shared development API_TOKEN, and is NOT connected to user session permissions yet. Do not deploy this to shared academy LAN computers until authorization, brute-force protection, and protected transport are completed.

## Administrator user management groundwork
`user-management.mjs` adds username/role validation, administrator-only account listing, and disabled account creation. The administrator cannot select or read employee passwords. `004_password_setup.sql` reserves expiring one-use setup tokens. **No first admin provisioning, token issuance, redemption, or protected admin HTTP endpoints exist yet.** Do not expose unfinished account flows on LAN.
