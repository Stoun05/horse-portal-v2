const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),os=require("node:os"),path=require("node:path");
const {randomBytes}=require("node:crypto");
const {openAccountOfflineStore}=require("../account-offline-store.cjs");
const {createHorseSyncSender}=require("../sync-transport.cjs");
const {flushPending}=require("../sync-runner.cjs");
test("encrypted horse queue survives outage and syncs exactly once after restart",async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"horse-sync-full-"));
 const key=randomBytes(32),userId="53a25d93-52be-4cab-8fea-f344f9340c9a",token="a".repeat(64);
 try{
  let store=openAccountOfflineStore({root,userId,key});
  const id=store.addLocalChange({entityId:"horse-1",action:"create",payload:{name:"Akýol",code:"AT-1",breed:"Ahalteke",sex:"At",year:2020}});
  const down=createHorseSyncSender({token,fetchImpl:async()=>{throw Error("offline");}});
  assert.equal((await flushPending({store,send:down})).state,"retry");
  store=openAccountOfflineStore({root,userId,key});
  assert.equal(store.listPending()[0].id,id);
  let count=0;
  const up=createHorseSyncSender({token,fetchImpl:async(url,options)=>{
   count++;
   const payload=JSON.parse(options.body);
   assert.equal(payload.changeId,id);
   assert.equal(payload.payload.name,"Akýol");
   return {status:200,json:async()=>({changeId:id,status:"accepted",serverVersion:1})};
  }});
  assert.equal((await flushPending({store,send:up})).state,"complete");
  assert.equal(count,1);
  const recovered=openAccountOfflineStore({root,userId,key});
  assert.equal(recovered.listPending().length,0);
  assert.equal(recovered.listHorses()["horse-1"].name,"Akýol");
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test("server conflict cannot erase encrypted local horse edits",async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"horse-sync-conflict-"));
 const key=randomBytes(32),userId="53a25d93-52be-4cab-8fea-f344f9340c9a",token="b".repeat(64);
 try{
  const store=openAccountOfflineStore({root,userId,key});
  const created=store.addLocalChange({entityId:"horse-2",action:"create",payload:{name:"Original horse",code:"AT-2"}});
  assert.equal(store.acknowledge(created,{changeId:created,status:"accepted",serverVersion:1}),true);
  const id=store.addLocalChange({entityId:"horse-2",action:"update",baseVersion:1,payload:{name:"New local horse",code:"AT-2"}});
  const send=createHorseSyncSender({token,fetchImpl:async()=>({status:409,json:async()=>({changeId:id,status:"conflict",serverVersion:2})})});
  assert.equal((await flushPending({store,send})).state,"conflict");
  const recovered=openAccountOfflineStore({root,userId,key});
  assert.equal(recovered.listPending()[0].status,"conflict");
  assert.equal(recovered.listHorses()["horse-2"].name,"New local horse");
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
