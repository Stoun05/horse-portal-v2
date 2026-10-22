const test=require("node:test");
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const {verifyOfflineGrant,canUseLocalAction}=require("../offline-access.cjs");
const secret="test-secret-for-unit-tests-not-production";
const now=1700000000000;
function signed(grant){const payload=JSON.stringify({userId:grant.userId,expiresAt:grant.expiresAt,permissions:grant.permissions});return crypto.createHmac("sha256",secret).update(payload).digest("hex")}
test("an authorized unexpired grant can be verified",()=>{
 const grant={userId:"user-a",expiresAt:now+60000,permissions:["horses:read","horses:create"]};
 const permitted=verifyOfflineGrant(grant,signed(grant),secret,"user-a",now);
 assert.equal(canUseLocalAction(permitted,"horses:create"),true);
 assert.equal(canUseLocalAction(permitted,"horses:delete"),false);
});
test("expired or altered grants fail closed",()=>{
 const grant={userId:"user-a",expiresAt:now+60000,permissions:["horses:read"]};
 assert.equal(verifyOfflineGrant(grant,signed(grant),secret,"user-a",now+60001),null);
 assert.equal(verifyOfflineGrant({...grant,permissions:["horses:delete"]},signed(grant),secret,"user-a",now),null);
 assert.equal(verifyOfflineGrant(grant,signed(grant),secret,"user-b",now),null);
 assert.equal(verifyOfflineGrant(grant,"bad",secret,"user-a",now),null);
});
