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

test("signed desktop window bridge revokes catalog IPC when window closes",async()=>{
 const {EventEmitter}=require("node:events");
 const {attachAuthorizedWindow}=require("../authorized-window.cjs");
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"atcylyk-window-"));
 try{
  const grant={userId,expiresAt:Date.now()+60000,permissions:["horses:read"]};
  const frame={url:"http://127.0.0.1:4444/atlar"};
  const webContents=new EventEmitter();
  webContents.mainFrame=frame;
  const handlers=new Map();
  const ipcMain={handle:(n,fn)=>handlers.set(n,fn),removeHandler:n=>handlers.delete(n)};
  const close=attachAuthorizedWindow({ipcMain,webContents,expectedOrigin:"http://127.0.0.1:4444",root,userId,safeStorage,publicKey,grant,signature:signed(grant),platform:"win32"});
  const event={sender:webContents,senderFrame:frame};
  const read=handlers.get("offline:horses");
  assert.deepEqual(await read(event),{});
  webContents.emit("destroyed");
  await assert.rejects(()=>read(event),/session closed/);
  assert.equal(handlers.size,0);
  close();
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test("desktop navigation revokes signed offline access and blocks captured IPC",async()=>{
 const {EventEmitter}=require("node:events");
 const {attachAuthorizedWindow}=require("../authorized-window.cjs");
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"horse-navigation-"));
 try{
  const grant={userId,expiresAt:Date.now()+60000,permissions:["horses:read"]};
  const frame={url:"http://127.0.0.1:4444/atlar"};
  const webContents=new EventEmitter();
  webContents.mainFrame=frame;
  const handlers=new Map();
  const ipcMain={handle:(name,fn)=>handlers.set(name,fn),removeHandler:name=>handlers.delete(name)};
  const revoke=attachAuthorizedWindow({ipcMain,webContents,expectedOrigin:"http://127.0.0.1:4444",root,userId,safeStorage,publicKey,grant,signature:signed(grant),platform:"win32"});
  const event={sender:webContents,senderFrame:frame};
  const cachedRead=handlers.get("offline:horses");
  assert.deepEqual(await cachedRead(event),{});
  webContents.emit("did-navigate");
  assert.equal(handlers.size,0);
  await assert.rejects(()=>cachedRead(event),/session closed/);
  revoke();
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test("navigation start immediately revokes offline catalog access",async()=>{
 const {EventEmitter}=require("node:events");
 const {attachAuthorizedWindow}=require("../authorized-window.cjs");
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"horse-nav-start-"));
 try {
  const grant={userId,expiresAt:Date.now()+60000,permissions:["horses:read"]};
  const webContents=new EventEmitter(),frame={url:"http://127.0.0.1:4444/atlar"};
  webContents.mainFrame=frame;
  const handlers=new Map();
  const ipcMain={handle:(n,h)=>handlers.set(n,h),removeHandler:n=>handlers.delete(n)};
  const revoke=attachAuthorizedWindow({ipcMain,webContents,expectedOrigin:"http://127.0.0.1:4444",root,userId,safeStorage,publicKey,grant,signature:signed(grant),platform:"win32"});
  const oldRead=handlers.get("offline:horses");
  assert.deepEqual(await oldRead({sender:webContents,senderFrame:frame}),{});
  webContents.emit("did-start-navigation");
  assert.equal(handlers.size,0);
  await assert.rejects(()=>oldRead({sender:webContents,senderFrame:frame}),/session closed/);
  revoke();
 } finally {fs.rmSync(root,{recursive:true,force:true});}
});

test("second desktop session cannot steal active global offline IPC handlers",async()=>{
 const {EventEmitter}=require("node:events");
 const {attachAuthorizedWindow}=require("../authorized-window.cjs");
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"atcylyk-two-sessions-"));
 try{
  const grant={userId,expiresAt:Date.now()+60000,permissions:["horses:read"]};
  const makeWindow=()=>{const sender=new EventEmitter();sender.mainFrame={url:"http://127.0.0.1:4444/atlar"};return sender;};
  const one=makeWindow(),two=makeWindow(),handlers=new Map();
  const ipcMain={handle:(n,fn)=>handlers.set(n,fn),removeHandler:n=>handlers.delete(n)};
  const options={ipcMain,expectedOrigin:"http://127.0.0.1:4444",root,userId,safeStorage,publicKey,grant,signature:signed(grant),platform:"win32"};
  const close=attachAuthorizedWindow({...options,webContents:one});
  const saved=handlers.get("offline:horses");
  assert.throws(()=>attachAuthorizedWindow({...options,webContents:two}),/already active/);
  assert.deepEqual(await saved({sender:one,senderFrame:one.mainFrame}),{});
  close();
  assert.equal(handlers.size,0);
  const closeTwo=attachAuthorizedWindow({...options,webContents:two});
  assert.deepEqual(await handlers.get("offline:horses")({sender:two,senderFrame:two.mainFrame}),{});
  closeTwo();
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test("failed lifecycle listener setup releases offline IPC for next login",()=>{
 const {EventEmitter}=require("node:events");
 const {attachAuthorizedWindow}=require("../authorized-window.cjs");
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"atcylyk-lifecycle-fail-"));
 try{
  const grant={userId,expiresAt:Date.now()+60000,permissions:["horses:read"]};
  const frame={url:"http://127.0.0.1:4444/atlar"};
  const broken=new EventEmitter();broken.mainFrame=frame;
  const original=broken.on.bind(broken);
  broken.on=(event,listener)=>{if(event==="render-process-gone")throw Error("Listener setup failed");return original(event,listener);};
  const handlers=new Map();
  const ipcMain={handle:(name,handler)=>handlers.set(name,handler),removeHandler:name=>handlers.delete(name)};
  const opts={ipcMain,expectedOrigin:"http://127.0.0.1:4444",root,userId,safeStorage,publicKey,grant,signature:signed(grant),platform:"win32"};
  assert.throws(()=>attachAuthorizedWindow({...opts,webContents:broken}),/Listener setup failed/);
  assert.equal(handlers.size,0);
  const healthy=new EventEmitter();healthy.mainFrame=frame;
  const close=attachAuthorizedWindow({...opts,webContents:healthy});
  assert.equal(handlers.size,3);
  close();
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
