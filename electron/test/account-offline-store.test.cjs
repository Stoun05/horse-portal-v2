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
  assert.equal(store.acknowledge(id),true);
  assert.equal(openAccountOfflineStore({root,userId:a,key:keyA}).listPending().length,0);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test("conflicted changes remain on disk and cannot be acknowledged automatically",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"account-conflict-")),key=randomBytes(32);
 try {
  let store=openAccountOfflineStore({root,userId:a,key});
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
