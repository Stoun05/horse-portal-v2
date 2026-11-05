import test from "node:test";
import assert from "node:assert/strict";
import { validateSyncChange, maySyncHorse } from "../src/sync-validation.mjs";
const id="9a7ef1ab-30e3-4e62-944f-917573987678";
test("sync changes require stable UUID and base version",()=>{
  assert.equal(validateSyncChange({changeId:id,entityId:"horse-01",action:"create",baseVersion:null,payload:{name:"Akýol"}}),true);
  assert.equal(validateSyncChange({changeId:id,entityId:"horse-01",action:"update",baseVersion:4,payload:{name:"Akýol"}}),true);
  assert.equal(validateSyncChange({changeId:id,entityId:"horse-01",action:"update",baseVersion:null,payload:{name:"Akýol"}}),false);
  assert.equal(validateSyncChange({changeId:"bad",entityId:"horse-01",action:"delete",baseVersion:1}),false);
});
test("server role checks fail closed",()=>{
  assert.equal(maySyncHorse("Admin","delete"),true);
  assert.equal(maySyncHorse("Operator","create"),true);
  assert.equal(maySyncHorse("Operator","delete"),false);
  assert.equal(maySyncHorse("Gözegçi","update"),false);
});
