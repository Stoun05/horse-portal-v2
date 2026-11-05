import { sign } from "node:crypto";
import { can } from "./permissions.mjs";
const ALLOWED = ["horses:read","horses:create","horses:update","horses:delete"];
const MAX_TTL_MS = 15 * 60 * 1000;
// The private key must be provisioned securely on the server, never committed.
export function issueOfflineGrant(user, privateKey, now=Date.now(), ttlMs=MAX_TTL_MS) {
 if (!user?.id || !user?.role || !privateKey) throw Error("Authenticated user and private key required");
 if (!Number.isSafeInteger(now) || !Number.isInteger(ttlMs) || ttlMs <= 0 || ttlMs > MAX_TTL_MS) throw Error("Invalid grant lifetime");
 const permissions=ALLOWED.filter(permission=>can(user.role,permission));
 if (!permissions.includes("horses:read")) throw Error("Offline access denied");
 const grant={userId:user.id,expiresAt:now+ttlMs,permissions};
 const payload=JSON.stringify(grant);
 const signature=sign(null,Buffer.from(payload),privateKey).toString("hex");
 return {grant,signature};
}
