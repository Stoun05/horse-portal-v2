const { createHmac, timingSafeEqual } = require("node:crypto");
const ACTIONS = new Set(["horses:read","horses:create","horses:update","horses:delete"]);
function safeEqual(a,b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const x=Buffer.from(a,"hex"), y=Buffer.from(b,"hex");
  return x.length === 32 && y.length === 32 && timingSafeEqual(x,y);
}
function signGrant(payload,secret) {
  if (typeof secret !== "string" || secret.length < 32) throw new Error("Invalid signing secret");
  return createHmac("sha256",secret).update(payload).digest("hex");
}
// The signature must be issued by the server. The desktop must never own the signing secret.
// This module is a verification contract, not an enabled offline authentication flow.
function verifyOfflineGrant(grant, signature, secret, userId, now = Date.now()) {
  if (!grant || typeof grant !== "object" || Array.isArray(grant) ||
      typeof grant.userId !== "string" || grant.userId !== userId ||
      !Number.isSafeInteger(grant.expiresAt) || grant.expiresAt <= now ||
      !Array.isArray(grant.permissions) || !grant.permissions.every(x=>ACTIONS.has(x))) return null;
  const canonical = JSON.stringify({ userId: grant.userId, expiresAt: grant.expiresAt, permissions: grant.permissions });
  if (!safeEqual(signGrant(canonical,secret),signature)) return null;
  return new Set(grant.permissions);
}
function canUseLocalAction(verifiedPermissions,action) {
  return verifiedPermissions instanceof Set && ACTIONS.has(action) && verifiedPermissions.has(action);
}
module.exports={verifyOfflineGrant,canUseLocalAction};
