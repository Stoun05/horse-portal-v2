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

The server initially binds to localhost (HOST=127.0.0.1). Binding to HOST=0.0.0.0 enables LAN listening **only once** authentication, authorization, firewall restrictions, backup policy, and TLS or equivalent network protection are in place. Do not open this service to the public internet.

Schema currently contains tables for horses, users and audit events. These are preparation, not active persistence; the UI still uses browser localStorage. Authentication and protected CRUD routes are not implemented in phase 1.

Never commit `.env`, passwords, medical histories, real user records, or database dumps.
