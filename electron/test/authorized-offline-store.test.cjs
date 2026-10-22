const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),os=require("node:os"),path=require("node:path"),crypto=require("node:crypto");
const {openAuthorizedOfflineStore}=require("../authorized-offline-store.cjs");
const {publicKey,privateKey}=crypto.generateKeyPairSync("ed25519");
const safeStorage={isEncryptionAvailable:()=>true,encryptString:s=>Buffer.from("protected:"+s),decryptString:b=>b.toString().slice(10)};
const userId="53a25d93-52be-4cab-8fea-f344f9340c9a";
function signed(grant){return crypto.sign(null,Buffer.from(JSON.stringify({userId:grant.userId,expiresAt:grant.expiresAt,permissions:grant.permissions})),privateKey).toString("hex");}
test("read-only grant prevents offline edits",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"atcylyk-grant-"));
 try{
  const grant={userId,expiresAt:Date.now()+60000,permissions:["horses:read"]};
  const store=openAuthorizedOfflineStore({root,userId,safeStorage,publicKey,grant,signature:signed(grant),platform:"win32"});
  assert.deepEqual(store.listHorses(),{});
  assert.equal(store.lastSyncedAt(),null);
  assert.throws(()=>store.addLocalChange({entityId:"horse-1",action:"create",payload:{name:"Akyol"}}),/forbidden/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test("tampered or expired offline grant is rejected",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"atcylyk-grant-bad-"));
 try{
  const grant={userId,expiresAt:Date.now()+60000,permissions:["horses:read"]};
  assert.throws(()=>openAuthorizedOfflineStore({root,userId,safeStorage,publicKey,grant:{...grant,permissions:["horses:read","horses:create"]},signature:signed(grant),platform:"win32"}),/denied/);
  assert.throws(()=>openAuthorizedOfflineStore({root,userId,safeStorage,publicKey,grant:{...grant,expiresAt:1},signature:signed(grant),platform:"win32"}),/denied/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test("expired grant also blocks reads from an already opened store",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"atcylyk-grant-expiry-"));
 try{
  const grant={userId,expiresAt:Date.now()+60000,permissions:["horses:read","horses:create"]};
  const store=openAuthorizedOfflineStore({root,userId,safeStorage,publicKey,grant,signature:signed(grant),platform:"win32"});
  assert.deepEqual(store.listHorses(),{});
  const original=Date.now;
  Date.now=()=>grant.expiresAt+1;
  try{
   assert.throws(()=>store.listHorses(),/expired/);
   assert.throws(()=>store.listPending(),/expired/);
   assert.throws(()=>store.lastSyncedAt(),/expired/);
   assert.throws(()=>store.addLocalChange({entityId:"h1",action:"create",payload:{name:"Horse"}}),/expired/);
  }finally{Date.now=original;}
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
