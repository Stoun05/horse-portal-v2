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

test("encrypted horse create update delete lifecycle survives desktop restarts",async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"horse-sync-lifecycle-"));
 const key=randomBytes(32),userId="53a25d93-52be-4cab-8fea-f344f9340c9a",token="c".repeat(64);
 const horseId="horse-lifecycle";
 let serverVersion=0,serverHorse=null;
 const requests=[];
 const send=createHorseSyncSender({token,fetchImpl:async(_url,options)=>{
  const change=JSON.parse(options.body);
  requests.push(change);
  assert.equal(change.entityId,horseId);
  if(change.action==="create"){
   assert.equal(change.baseVersion,null);
   assert.equal(serverVersion,0);
   serverHorse=change.payload;
  }else{
   assert.equal(change.baseVersion,serverVersion);
   assert.ok(serverHorse);
   if(change.action==="update")serverHorse=change.payload;
   else if(change.action==="delete")serverHorse=null;
   else throw Error("Unexpected action");
  }
  serverVersion++;
  return {status:200,json:async()=>({changeId:change.changeId,status:"accepted",serverVersion})};
 }});
 try{
  let store=openAccountOfflineStore({root,userId,key});
  store.addLocalChange({entityId:horseId,action:"create",payload:{name:"Akýol",code:"AT-1"}});
  store=openAccountOfflineStore({root,userId,key});
  assert.equal((await flushPending({store,send})).state,"complete");
  assert.equal(store.listHorseVersions()[horseId],1);
  store=openAccountOfflineStore({root,userId,key});
  store.addLocalChange({entityId:horseId,action:"update",baseVersion:1,payload:{name:"Akýol updated",code:"AT-1"}});
  store=openAccountOfflineStore({root,userId,key});
  assert.equal((await flushPending({store,send})).state,"complete");
  assert.equal(store.listHorseVersions()[horseId],2);
  assert.equal(store.listHorses()[horseId].name,"Akýol updated");
  store=openAccountOfflineStore({root,userId,key});
  store.addLocalChange({entityId:horseId,action:"delete",baseVersion:2});
  store=openAccountOfflineStore({root,userId,key});
  assert.equal(store.listHorses()[horseId],undefined);
  assert.equal((await flushPending({store,send})).state,"complete");
  const recovered=openAccountOfflineStore({root,userId,key});
  assert.equal(recovered.listPending().length,0);
  assert.equal(recovered.listHorses()[horseId],undefined);
  assert.equal(recovered.listHorseVersions()[horseId],undefined);
  assert.equal(serverHorse,null);
  assert.equal(serverVersion,3);
  assert.deepEqual(requests.map(r=>[r.action,r.baseVersion]),[["create",null],["update",1],["delete",2]]);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test("lost server acknowledgement retries same change ID without duplicating horse",async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"horse-sync-lost-ack-"));
 const key=randomBytes(32),userId="53a25d93-52be-4cab-8fea-f344f9340c9a",token="d".repeat(64);
 const committed=new Map(),received=[];
 try{
  let store=openAccountOfflineStore({root,userId,key});
  const id=store.addLocalChange({entityId:"retry-horse",action:"create",payload:{name:"Akýol",code:"AT-9"}});
  const send=createHorseSyncSender({token,fetchImpl:async(_url,options)=>{
   const change=JSON.parse(options.body);
   received.push(change.changeId);
   if(!committed.has(change.changeId))committed.set(change.changeId,{changeId:change.changeId,status:"accepted",serverVersion:1});
   if(received.length===1)throw Error("Response lost after server committed");
   return {status:200,json:async()=>committed.get(change.changeId)};
  }});
  assert.equal((await flushPending({store,send})).state,"retry");
  assert.equal(store.listPending()[0].id,id);
  store=openAccountOfflineStore({root,userId,key});
  assert.equal((await flushPending({store,send})).state,"complete");
  const recovered=openAccountOfflineStore({root,userId,key});
  assert.deepEqual(received,[id,id]);
  assert.equal(committed.size,1);
  assert.equal(recovered.listPending().length,0);
  assert.equal(recovered.listHorseVersions()["retry-horse"],1);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
