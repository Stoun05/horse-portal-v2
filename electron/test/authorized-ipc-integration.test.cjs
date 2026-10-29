const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),os=require("node:os"),path=require("node:path"),crypto=require("node:crypto");
const {openAuthorizedOfflineStore}=require("../authorized-offline-store.cjs");
const {registerOfflineReadIpc}=require("../offline-ipc.cjs");
const userId="53a25d93-52be-4cab-8fea-f344f9340c9a";
const safeStorage={isEncryptionAvailable:()=>true,encryptString:s=>Buffer.from("protected:"+s),decryptString:b=>b.toString().slice(10)};
test("real encrypted per-user store serves only authorized main-frame IPC reads",async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"horse-ipc-integration-"));
 const {publicKey,privateKey}=crypto.generateKeyPairSync("ed25519");
 const grant={userId,expiresAt:Date.now()+60000,permissions:["horses:read","horses:create"]};
 const signature=crypto.sign(null,Buffer.from(JSON.stringify(grant)),privateKey).toString("hex");
 try {
  const store=openAuthorizedOfflineStore({root,userId,safeStorage,publicKey,grant,signature,platform:"win32"});
  store.addLocalChange({entityId:"horse-1",action:"create",payload:{name:"Akýol",code:"AT-1"}});
  const handlers=new Map();
  const ipcMain={handle:(name,handler)=>handlers.set(name,handler),removeHandler:name=>handlers.delete(name)};
  const cleanup=registerOfflineReadIpc({ipcMain,store,expectedOrigin:"http://127.0.0.1:4444"});
  const mainFrame={url:"http://127.0.0.1:4444/atlar"};
  const event={sender:{mainFrame},senderFrame:mainFrame};
  assert.equal((await handlers.get("offline:horses")(event))["horse-1"].name,"Akýol");
  assert.equal(await handlers.get("offline:pending-count")(event),1);
  assert.deepEqual(await handlers.get("offline:status")(event),{lastSyncedAt:null,pendingCount:1});
  await assert.rejects(()=>handlers.get("offline:horses")({sender:{mainFrame},senderFrame:{url:mainFrame.url}}),/Forbidden/);
  const now=Date.now;
  Date.now=()=>grant.expiresAt+1;
  try{await assert.rejects(()=>handlers.get("offline:status")(event),/expired/);}
  finally{Date.now=now;}
  cleanup();
  assert.equal(handlers.size,0);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
