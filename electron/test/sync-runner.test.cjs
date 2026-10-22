const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),os=require("node:os"),path=require("node:path");
const {randomBytes}=require("node:crypto");
const {openAccountOfflineStore}=require("../account-offline-store.cjs");
const {flushPending}=require("../sync-runner.cjs");
const userId="53a25d93-52be-4cab-8fea-f344f9340c9a";
async function withStore(fn){const root=fs.mkdtempSync(path.join(os.tmpdir(),"sync-runner-")),key=randomBytes(32);try{await fn(openAccountOfflineStore({root,userId,key}),()=>openAccountOfflineStore({root,userId,key}));}finally{fs.rmSync(root,{recursive:true,force:true});}}
test("sequential acknowledgements clear encrypted queue",()=>withStore(async(store,reload)=>{
 const first=store.addLocalChange({entityId:"h1",action:"create",payload:{name:"Horse 1"}});
 const second=store.addLocalChange({entityId:"h2",action:"create",payload:{name:"Horse 2"}});
 const ids=[];
 const result=await flushPending({store,send:async change=>{ids.push(change.changeId);return {changeId:change.changeId,status:"accepted",serverVersion:1};}});
 assert.deepEqual(ids,[first,second]);assert.deepEqual(result,{state:"complete",acknowledged:2,conflicted:0});assert.equal(reload().listPending().length,0);
}));
test("network failure preserves pending operations",()=>withStore(async(store,reload)=>{
 store.addLocalChange({entityId:"h1",action:"create",payload:{name:"Horse"}});
 assert.equal((await flushPending({store,send:async()=>{throw Error("offline");}})).state,"retry");
 assert.equal(reload().listPending().length,1);
}));
test("conflict is retained, blocks following changes",()=>withStore(async(store,reload)=>{
 const id=store.addLocalChange({entityId:"h1",action:"create",payload:{name:"Horse"}});
 store.addLocalChange({entityId:"h2",action:"create",payload:{name:"Horse2"}});
 let calls=0;
 const result=await flushPending({store,send:async()=>{calls++;return {changeId:id,status:"conflict"};}});
 assert.equal(result.state,"conflict");assert.equal(calls,1);
 assert.equal(reload().listPending()[0].status,"conflict");assert.equal(reload().listPending().length,2);
}));
test("forbidden and malformed acknowledgements never clear queue",()=>withStore(async(store,reload)=>{
 const id=store.addLocalChange({entityId:"h1",action:"create",payload:{name:"Horse"}});
 assert.equal((await flushPending({store,send:async()=>({changeId:id,status:"forbidden"})})).state,"blocked");
 assert.equal((await flushPending({store,send:async()=>({changeId:id,status:"accepted",serverVersion:9})})).state,"retry");
 assert.equal(reload().listPending().length,1);
}));
