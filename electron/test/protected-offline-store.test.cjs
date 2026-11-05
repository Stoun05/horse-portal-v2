const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const {openProtectedOfflineStore}=require("../protected-offline-store.cjs");
const {keyPath}=require("../offline-key-store.cjs");
const user="53a25d93-52be-4cab-8fea-f344f9340c9a";
const mock={isEncryptionAvailable:()=>true,encryptString:s=>Buffer.from("wrapped:"+s),decryptString:b=>b.toString("utf8").replace(/^wrapped:/,"")};
test("encrypted offline queue survives reopening with same Windows account key",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"atcylyk-protected-"));
 try{
  let store=openProtectedOfflineStore({root,userId:user,safeStorage:mock,platform:"win32"});
  const id=store.addLocalChange({entityId:"horse-1",action:"create",payload:{name:"Akyol"}});
  store=openProtectedOfflineStore({root,userId:user,safeStorage:mock,platform:"win32"});
  assert.equal(store.listPending()[0].id,id);
  assert.equal(store.listHorses()["horse-1"].name,"Akyol");
  fs.unlinkSync(keyPath(root,user));
  assert.throws(()=>openProtectedOfflineStore({root,userId:user,safeStorage:mock,platform:"win32"}),/recovery required/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test("corrupt wrapped key never causes a new key or vault reset",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"atcylyk-badkey-"));
 try {
  const store=openProtectedOfflineStore({root,userId:user,safeStorage:mock,platform:"win32"});
  store.addLocalChange({entityId:"horse-2",action:"create",payload:{name:"Parasat"}});
  const filename=keyPath(root,user);
  fs.writeFileSync(filename,"not-a-valid-protected-key");
  assert.throws(()=>openProtectedOfflineStore({root,userId:user,safeStorage:mock,platform:"win32"}));
  assert.equal(fs.readFileSync(filename,"utf8"),"not-a-valid-protected-key");
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test("Windows store fails closed if OS encryption is disabled",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"atcylyk-disabled-"));
 try{
  assert.throws(()=>openProtectedOfflineStore({root,userId:user,safeStorage:{isEncryptionAvailable:()=>false},platform:"win32"}),/unavailable/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
