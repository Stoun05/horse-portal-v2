const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const {randomBytes}=require("node:crypto");
const {openAccountOfflineStore}=require("../account-offline-store.cjs");
const {accountPath}=require("../offline-vault.cjs");
const a="53a25d93-52be-4cab-8fea-f344f9340c9a",b="75d5ab33-bb19-42d3-a676-813835c55d02";
test("encrypted pending edits persist on disk and separate accounts",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"account-offline-"));
 const keyA=randomBytes(32),keyB=randomBytes(32);
 try{
  let store=openAccountOfflineStore({root,userId:a,key:keyA});
  const id=store.addLocalChange({entityId:"horse-1",action:"create",payload:{name:"Akyol"}});
  assert.equal(fs.readFileSync(accountPath(root,a),"utf8").includes("Akyol"),false);
  store=openAccountOfflineStore({root,userId:a,key:keyA});
  assert.equal(store.listPending()[0].id,id);
  assert.equal(store.listHorses()["horse-1"].name,"Akyol");
  assert.deepEqual(openAccountOfflineStore({root,userId:b,key:keyB}).listHorses(),{});
  assert.throws(()=>openAccountOfflineStore({root,userId:a,key:keyB}));
  assert.equal(store.acknowledge(id,{changeId:id,status:"accepted",serverVersion:1}),true);
  assert.equal(openAccountOfflineStore({root,userId:a,key:keyA}).listPending().length,0);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test("conflicted changes remain on disk and cannot be acknowledged automatically",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"account-conflict-")),key=randomBytes(32);
 try {
  let store=openAccountOfflineStore({root,userId:a,key});
  const first=store.addLocalChange({entityId:"horse-1",action:"create",payload:{name:"Initial"}});
  assert.equal(store.acknowledge(first,{changeId:first,status:"accepted",serverVersion:1}),true);
  const id=store.addLocalChange({entityId:"horse-1",action:"update",payload:{name:"Updated"},baseVersion:1});
  assert.equal(store.markConflict(id),true);
  store=openAccountOfflineStore({root,userId:a,key});
  assert.equal(store.listPending()[0].status,"conflict");
  assert.equal(store.acknowledge(id),false);
  assert.equal(store.listPending().length,1);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test("failed vault write does not alter previously saved data",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"account-failure-")),key=randomBytes(32);
 try{
  const store=openAccountOfflineStore({root,userId:a,key});
  store.addLocalChange({entityId:"horse-1",action:"create",payload:{name:"Initial"}});
  assert.throws(()=>store.addLocalChange({entityId:"horse-2",action:"create",payload:{name:"Bad", impossible:BigInt(9)}}));
  const reopened=openAccountOfflineStore({root,userId:a,key});
  assert.equal(reopened.listPending().length,1);
  assert.equal(reopened.listHorses()["horse-1"].name,"Initial");
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test("tampered encrypted vault must not silently reset or overwrite account data",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"account-tamper-")),key=randomBytes(32);
 try {
  const store=openAccountOfflineStore({root,userId:a,key});
  store.addLocalChange({entityId:"horse-1",action:"create",payload:{name:"Akyol"}});
  const filename=accountPath(root,a);
  const damaged=JSON.parse(fs.readFileSync(filename,"utf8"));
  damaged.tag=Buffer.alloc(16).toString("base64");
  fs.writeFileSync(filename,JSON.stringify(damaged));
  assert.throws(()=>openAccountOfflineStore({root,userId:a,key}));
  assert.equal(fs.existsSync(filename),true);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test("a second offline edit to the same horse is blocked until first sync",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"account-order-")),key=randomBytes(32);
 try {
  const store=openAccountOfflineStore({root,userId:a,key});
  const id=store.addLocalChange({entityId:"horse-1",action:"create",payload:{name:"First"}});
  assert.throws(()=>store.addLocalChange({entityId:"horse-1",action:"update",baseVersion:1,payload:{name:"Second"}}),/Pending change/);
  assert.equal(store.listPending().length,1);
  assert.equal(store.acknowledge(id,{changeId:id,status:"accepted",serverVersion:1}),true);
  const reopened=openAccountOfflineStore({root,userId:a,key});
  assert.equal(reopened.listPending().length,0);
  assert.equal(reopened.listHorses()["horse-1"].name,"First");
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test("timeout and mismatched acknowledgement never clear offline queue",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"account-ack-")),key=randomBytes(32);
 try{
  const store=openAccountOfflineStore({root,userId:a,key});
  const id=store.addLocalChange({entityId:"horse-3",action:"create",payload:{name:"Sowgat"}});
  assert.equal(store.acknowledge(id),false);
  assert.equal(store.acknowledge(id,{changeId:"different",status:"accepted",serverVersion:1}),false);
  assert.equal(store.acknowledge(id,{changeId:id,status:"conflict",serverVersion:1}),false);
  assert.equal(openAccountOfflineStore({root,userId:a,key}).listPending().length,1);
  assert.equal(store.acknowledge(id,{changeId:id,status:"accepted",serverVersion:1}),true);
  assert.equal(openAccountOfflineStore({root,userId:a,key}).listPending().length,0);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test("stale account handle cannot overwrite a newer encrypted write",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"account-stale-")),key=randomBytes(32);
 try{
  const first=openAccountOfflineStore({root,userId:a,key});
  const stale=openAccountOfflineStore({root,userId:a,key});
  first.addLocalChange({entityId:"h1",action:"create",payload:{name:"Newest"}});
  assert.throws(()=>stale.addLocalChange({entityId:"h2",action:"create",payload:{name:"Stale"}}),/changed since opening/);
  const reopened=openAccountOfflineStore({root,userId:a,key});
  assert.equal(reopened.listPending().length,1);
  assert.equal(reopened.listHorses().h1.name,"Newest");
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test("existing vault lock prevents any queued horse change",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"account-lock-")),key=randomBytes(32);
 try{
  const store=openAccountOfflineStore({root,userId:a,key});
  const filename=accountPath(root,a);
  fs.mkdirSync(path.dirname(filename),{recursive:true});
  const lockPath=filename+".lock";
  fs.writeFileSync(lockPath,"held");
  assert.throws(()=>store.addLocalChange({entityId:"horse-locked",action:"create",payload:{name:"Protected"}}),/EEXIST/);
  assert.equal(store.listPending().length,0);
  assert.equal(fs.readFileSync(lockPath,"utf8"),"held");
  fs.unlinkSync(lockPath);
  store.addLocalChange({entityId:"horse-locked",action:"create",payload:{name:"Protected"}});
  assert.equal(openAccountOfflineStore({root,userId:a,key}).listPending().length,1);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test("failed encrypted write releases own lock but keeps earlier horse edits",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"account-write-lock-failure-")),key=randomBytes(32);
 try{
  const store=openAccountOfflineStore({root,userId:a,key});
  store.addLocalChange({entityId:"h1",action:"create",payload:{name:"Saved"}});
  const filename=accountPath(root,a);
  assert.throws(()=>store.addLocalChange({entityId:"h2",action:"create",payload:{name:"Invalid",broken:BigInt(1)}}));
  assert.equal(fs.existsSync(filename+".lock"),false,"own lock should be released after serialization fails");
  store.addLocalChange({entityId:"h3",action:"create",payload:{name:"After failure"}});
  const reopened=openAccountOfflineStore({root,userId:a,key});
  assert.deepEqual(reopened.listPending().map(x=>x.entity_id),["h1","h3"]);
  assert.equal(reopened.listHorses().h1.name,"Saved");
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test("a stale vault writer never deletes another process's lock",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"account-lock-owner-")),key=randomBytes(32);
 try{
  const first=openAccountOfflineStore({root,userId:a,key});
  const stale=openAccountOfflineStore({root,userId:a,key});
  first.addLocalChange({entityId:"h1",action:"create",payload:{name:"Authoritative"}});
  assert.throws(()=>stale.addLocalChange({entityId:"h2",action:"create",payload:{name:"Rejected"}}),/changed since opening/);
  const filename=accountPath(root,a);
  assert.equal(fs.existsSync(filename+".lock"),false);
  assert.equal(openAccountOfflineStore({root,userId:a,key}).listPending().length,1);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test("encrypted server versions persist and stale offline edits are blocked",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"account-version-")),key=randomBytes(32);
 try{
  let store=openAccountOfflineStore({root,userId:a,key});
  const id=store.addLocalChange({entityId:"horse-1",action:"create",payload:{name:"First"}});
  assert.equal(store.listHorseVersions()["horse-1"],undefined);
  assert.equal(store.acknowledge(id,{changeId:id,status:"accepted",serverVersion:1}),true);
  store=openAccountOfflineStore({root,userId:a,key});
  assert.equal(store.listHorseVersions()["horse-1"],1);
  assert.throws(()=>store.addLocalChange({entityId:"horse-1",action:"update",baseVersion:2,payload:{name:"Bad"}}),/stale/);
  const edit=store.addLocalChange({entityId:"horse-1",action:"update",baseVersion:1,payload:{name:"New"}});
  assert.equal(store.acknowledge(edit,{changeId:edit,status:"accepted",serverVersion:2}),true);
  assert.equal(openAccountOfflineStore({root,userId:a,key}).listHorseVersions()["horse-1"],2);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test("server horse import keeps unsent edits and ignores stale versions",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"account-import-")),key=randomBytes(32);
 try{
  let store=openAccountOfflineStore({root,userId:a,key});
  const local=store.addLocalChange({entityId:"local-1",action:"create",payload:{name:"Local",code:"L-1"}});
  const result=store.importServerHorses([
   {id:"local-1",version:1,data:{name:"Server copy",code:"L-1"}},
   {id:"remote-1",version:2,data:{name:"Remote",code:"R-1"}}
  ]);
  assert.deepEqual(result,{imported:1,skipped:1,removed:0});
  store=openAccountOfflineStore({root,userId:a,key});
  assert.equal(store.listHorses()["local-1"].name,"Local");
  assert.equal(store.listHorses()["remote-1"].name,"Remote");
  assert.equal(store.listHorseVersions()["remote-1"],2);
  assert.equal(store.listPending()[0].id,local);
  assert.deepEqual(store.importServerHorses([{id:"remote-1",version:1,data:{name:"Old",code:"R-1"}}]),{imported:0,skipped:1,removed:0});
  assert.equal(store.listHorses()["remote-1"].name,"Remote");
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test("server deletion removes confirmed cached horse but retains unsent local edit",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"account-remove-")),key=randomBytes(32);
 try{
  const store=openAccountOfflineStore({root,userId:a,key});
  store.importServerHorses([{id:"removed",version:1,data:{name:"Old",code:"OLD"}},{id:"edited",version:1,data:{name:"Edit",code:"EDIT"}}]);
  const change=store.addLocalChange({entityId:"edited",action:"update",baseVersion:1,payload:{name:"Local edit",code:"EDIT"}});
  assert.deepEqual(store.importServerHorses([]),{imported:0,skipped:0,removed:1});
  const reopened=openAccountOfflineStore({root,userId:a,key});
  assert.equal(reopened.listHorses().removed,undefined);
  assert.equal(reopened.listHorses().edited.name,"Local edit");
  assert.equal(reopened.listPending()[0].id,change);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
