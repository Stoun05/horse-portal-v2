const test=require("node:test");
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const {verifyOfflineGrant,canUseLocalAction}=require("../offline-access.cjs");
const {publicKey,privateKey}=crypto.generateKeyPairSync("ed25519");
const now=1700000000000;
function signed(grant){
 const payload=JSON.stringify({userId:grant.userId,expiresAt:grant.expiresAt,permissions:grant.permissions});
 return crypto.sign(null,Buffer.from(payload),privateKey).toString("hex");
}
test("valid signed account grant authorizes only listed rights",()=>{
 const grant={userId:"user-a",expiresAt:now+60000,permissions:["horses:read","horses:create"]};
 const permitted=verifyOfflineGrant(grant,signed(grant),publicKey,"user-a",now);
 assert.equal(canUseLocalAction(permitted,"horses:create"),true);
 assert.equal(canUseLocalAction(permitted,"horses:delete"),false);
});
test("tampered, expired, or mismatched grants are denied",()=>{
 const grant={userId:"user-a",expiresAt:now+60000,permissions:["horses:read"]};
 assert.equal(verifyOfflineGrant(grant,signed(grant),publicKey,"user-a",now+60001),null);
 assert.equal(verifyOfflineGrant({...grant,permissions:["horses:delete"]},signed(grant),publicKey,"user-a",now),null);
 assert.equal(verifyOfflineGrant(grant,signed(grant),publicKey,"user-b",now),null);
 assert.equal(verifyOfflineGrant(grant,"bad",publicKey,"user-a",now),null);
});
