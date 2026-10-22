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
