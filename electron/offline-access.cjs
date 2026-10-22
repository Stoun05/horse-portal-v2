const { verify } = require("node:crypto");
const ACTIONS = new Set(["horses:read","horses:create","horses:update","horses:delete"]);
// Public-key verification only: never embed signing credentials in the desktop application.
function verifyOfflineGrant(grant,signature,publicKey,userId,now=Date.now()) {
 if (!grant || typeof grant !== "object" || Array.isArray(grant) ||
     typeof grant.userId !== "string" || grant.userId !== userId ||
     !Number.isSafeInteger(grant.expiresAt) || grant.expiresAt <= now ||
     !Array.isArray(grant.permissions) || !grant.permissions.every(x=>ACTIONS.has(x)) ||
     typeof signature !== "string" || !/^[a-f0-9]{128}$/i.test(signature)) return null;
 const payload=JSON.stringify({userId:grant.userId,expiresAt:grant.expiresAt,permissions:grant.permissions});
 try {if (!verify(null,Buffer.from(payload),publicKey,Buffer.from(signature,"hex"))) return null;}
 catch {return null;}
 return new Set(grant.permissions);
}
function canUseLocalAction(verifiedPermissions,action) {
 return verifiedPermissions instanceof Set && ACTIONS.has(action) && verifiedPermissions.has(action);
}
module.exports={verifyOfflineGrant,canUseLocalAction};
