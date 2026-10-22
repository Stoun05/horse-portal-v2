import test from "node:test";
import assert from "node:assert/strict";
import {generateKeyPairSync,verify} from "node:crypto";
import {issueOfflineGrant} from "../src/offline-grants.mjs";
const {privateKey,publicKey}=generateKeyPairSync("ed25519");
test("signed grants include role-specific rights and expire quickly",()=>{
 const {grant,signature}=issueOfflineGrant({id:"staff-1",role:"Operator"},privateKey,1000,60000);
 assert.equal(grant.expiresAt,61000);
 assert.equal(grant.permissions.includes("horses:create"),true);
 assert.equal(grant.permissions.includes("horses:delete"),false);
 assert.equal(verify(null,Buffer.from(JSON.stringify(grant)),publicKey,Buffer.from(signature,"hex")),true);
});
test("observer cannot write and grant TTL is bounded",()=>{
 const {grant}=issueOfflineGrant({id:"observer",role:"Gözegçi"},privateKey,1000,60000);
 assert.deepEqual(grant.permissions,["horses:read"]);
 assert.throws(()=>issueOfflineGrant({id:"observer",role:"Gözegçi"},privateKey,1000,3600000),/lifetime/);
});
