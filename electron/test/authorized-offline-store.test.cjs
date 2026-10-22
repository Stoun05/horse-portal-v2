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

test("listener removal failure cannot leave authorized IPC readable",async()=>{
 const {EventEmitter}=require("node:events");
 const {attachAuthorizedWindow}=require("../authorized-window.cjs");
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"atcylyk-cleanup-fail-"));
 try {
  const grant={userId,expiresAt:Date.now()+60000,permissions:["horses:read"]};
  const webContents=new EventEmitter(),frame={url:"http://127.0.0.1:4444/atlar"};
  webContents.mainFrame=frame;
  const handlers=new Map();
  const ipcMain={handle:(k,v)=>handlers.set(k,v),removeHandler:k=>handlers.delete(k)};
  const close=attachAuthorizedWindow({ipcMain,webContents,expectedOrigin:"http://127.0.0.1:4444",root,userId,safeStorage,publicKey,grant,signature:signed(grant),platform:"win32"});
  const cached=handlers.get("offline:horses");
  const remove=webContents.removeListener.bind(webContents);
  webContents.removeListener=(event,fn)=>{if(event==="did-navigate")throw Error("cleanup failed");return remove(event,fn);};
  close();
  assert.equal(handlers.size,0);
  await assert.rejects(()=>cached({sender:webContents,senderFrame:frame}),/session closed/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test("main-process session controller revokes previous login and logout",()=>{
 const {createOfflineSessionController}=require("../offline-session-controller.cjs");
 let closes=0,opens=0;
 const controller=createOfflineSessionController({attach:()=>{opens++;return ()=>{closes++;};},ipcMain:{},webContents:{},expectedOrigin:"http://127.0.0.1:4444",safeStorage:{},root:"test"});
 controller.authorize({userId:"first"});
 controller.authorize({userId:"second"});
 assert.equal(opens,2);
 assert.equal(closes,1);
 controller.logout();
 controller.logout();
 assert.equal(closes,2);
});

test("session controller refuses closed Electron window and invalid cleanup",()=>{
 const {createOfflineSessionController}=require("../offline-session-controller.cjs");
 let attached=0;
 const closed=createOfflineSessionController({attach:()=>{attached++;return ()=>{};},ipcMain:{},webContents:{isDestroyed:()=>true},expectedOrigin:"http://127.0.0.1:4444",safeStorage:{},root:"test"});
 assert.throws(()=>closed.authorize({userId:"u"}),/window closed/);
 assert.equal(attached,0);
 const invalid=createOfflineSessionController({attach:()=>null,ipcMain:{},webContents:{},expectedOrigin:"http://127.0.0.1:4444",safeStorage:{},root:"test"});
 assert.throws(()=>invalid.authorize({userId:"u"}),/cleanup function/);
 invalid.logout();
});

test("offline session status only exposes activity and account identity",()=>{
 const {createOfflineSessionController}=require("../offline-session-controller.cjs");
 const controller=createOfflineSessionController({attach:()=>()=>{},ipcMain:{},webContents:{},expectedOrigin:"http://127.0.0.1:4444",safeStorage:{},root:"test"});
 assert.deepEqual(controller.getSessionStatus(),{active:false,userId:null});
 controller.authorize({userId:"user-1",grant:{secret:"private"},signature:"secret"});
 assert.deepEqual(controller.getSessionStatus(),{active:true,userId:"user-1"});
 assert.equal("signature" in controller.getSessionStatus(),false);
 controller.logout();
 assert.deepEqual(controller.getSessionStatus(),{active:false,userId:null});
});

test("logout aborts in-flight sync and new login gets a fresh signal",()=>{
 const {createOfflineSessionController}=require("../offline-session-controller.cjs");
 const controller=createOfflineSessionController({attach:()=>()=>{},ipcMain:{},webContents:{},expectedOrigin:"http://127.0.0.1:4444",safeStorage:{},root:"test"});
 controller.authorize({userId:"one"});
 const previous=controller.getSyncSignal();
 assert.equal(previous.aborted,false);
 controller.logout();
 assert.equal(previous.aborted,true);
 assert.throws(()=>controller.getSyncSignal(),/not authorized/);
 controller.authorize({userId:"two"});
 const next=controller.getSyncSignal();
 assert.equal(next.aborted,false);
 assert.notEqual(previous,next);
 controller.logout();
 assert.equal(next.aborted,true);
});

test("failed account switch does not leave a usable synchronization signal",()=>{
 const {createOfflineSessionController}=require("../offline-session-controller.cjs");
 let called=0,closed=0;
 const controller=createOfflineSessionController({attach:()=>{called++;if(called===2)throw Error("Login denied");return ()=>{closed++;};},ipcMain:{},webContents:{},expectedOrigin:"http://127.0.0.1:4444",safeStorage:{},root:"test"});
 controller.authorize({userId:"first"});
 const initial=controller.getSyncSignal();
 assert.throws(()=>controller.authorize({userId:"second"}),/Login denied/);
 assert.equal(initial.aborted,true);
 assert.equal(closed,1);
 assert.deepEqual(controller.getSessionStatus(),{active:false,userId:null});
 assert.throws(()=>controller.getSyncSignal(),/not authorized/);
});

test("navigation aborts sync signal and clears session controller identity",()=>{
 const {EventEmitter}=require("node:events");
 const {createOfflineSessionController}=require("../offline-session-controller.cjs");
 const sender=new EventEmitter();
 const controller=createOfflineSessionController({attach:()=>()=>{},ipcMain:{},webContents:sender,expectedOrigin:"http://127.0.0.1:4444",safeStorage:{},root:"test"});
 controller.authorize({userId:"horse-user"});
 const signal=controller.getSyncSignal();
 sender.emit("did-start-navigation");
 assert.equal(signal.aborted,true);
 assert.deepEqual(controller.getSessionStatus(),{active:false,userId:null});
 assert.throws(()=>controller.getSyncSignal(),/not authorized/);
});

test("disposed desktop controller removes listeners and cannot reauthorize",()=>{
 const {EventEmitter}=require("node:events");
 const {createOfflineSessionController}=require("../offline-session-controller.cjs");
 const window=new EventEmitter();
 const session=createOfflineSessionController({attach:()=>()=>{},ipcMain:{},webContents:window,expectedOrigin:"http://127.0.0.1:4444",safeStorage:{},root:"test"});
 session.authorize({userId:"horse-user"});
 assert.equal(window.listenerCount("destroyed"),1);
 session.dispose();
 session.dispose();
 assert.equal(window.listenerCount("destroyed"),0);
 assert.equal(window.listenerCount("did-start-navigation"),0);
 assert.equal(session.getSessionStatus().active,false);
 assert.throws(()=>session.authorize({userId:"next"}),/window closed/);
});

test("local login client keeps token in memory and revokes on logout",async()=>{
 const {createLocalLoginClient}=require("../local-login-client.cjs");
 const token="f".repeat(64);
 let logouts=0;
 const client=createLocalLoginClient({fetchImpl:async(url,options)=>{
  if(url.pathname==="/api/auth/login")return {status:200,json:async()=>({token,user:{id:userId,role:"Operator",username:"staff"}})};
  if(url.pathname==="/api/auth/logout"){assert.equal(options.headers.Authorization,"Bearer "+token);logouts++;return {status:200};}
  throw Error("Unexpected request");
 }});
 assert.equal(client.getSession(),null);
 assert.equal((await client.login("staff","test-password")).id,userId);
 assert.deepEqual(client.getSession().user,{id:userId,role:"Operator",username:"staff"});
 assert.equal("token" in client.getSession(),false);
 assert.equal(await client.withToken(value=>value),token);
 await assert.rejects(()=>client.login("staff","test-password"),/Logout/);
 await client.logout();
 assert.equal(logouts,1);
 assert.equal(client.getSession(),null);
 await assert.rejects(()=>client.withToken(()=>{}),/Not authenticated/);
});
test("local login client refuses untrusted remote URLs",()=>{
 const {createLocalLoginClient}=require("../local-login-client.cjs");
 assert.throws(()=>createLocalLoginClient({baseUrl:"https://remote.invalid/"}),/loopback/);
});

test("desktop login flow activates offline only with matching signed grant",async()=>{
 const {createDesktopLoginFlow}=require("../desktop-login-flow.cjs");
 let signedIn=false,activated=false,closed=0;
 const loginClient={
  login:async()=>{signedIn=true;return {id:userId,role:"Operator"};},
  logout:async()=>{signedIn=false;},
  withToken:async callback=>callback("token")
 };
 const offlineSessions={logout:()=>{closed++;activated=false;},authorize:()=>{activated=true;}};
 const flow=createDesktopLoginFlow({trustedPublicKey:publicKey,loginClient,offlineSessions,getSignedGrant:async()=>({grant:{userId},publicKey:publicKey.export({type:"spki",format:"pem"}),signature:"signature"})});
 await flow.login("operator","password");
 assert.equal(signedIn,true);
 assert.equal(activated,true);
 await flow.logout();
 assert.equal(signedIn,false);
 assert.equal(activated,false);
 assert.ok(closed>=2);
});
test("desktop login flow clears login if signed offline grant missing",async()=>{
 const {createDesktopLoginFlow}=require("../desktop-login-flow.cjs");
 let signedIn=false,activated=0;
 const loginClient={login:async()=>{signedIn=true;return {id:userId};},logout:async()=>{signedIn=false;},withToken:async cb=>cb("token")};
 const offlineSessions={logout:()=>{},authorize:()=>{activated++;}};
 const flow=createDesktopLoginFlow({trustedPublicKey:publicKey,loginClient,offlineSessions,getSignedGrant:async()=>null});
 await assert.rejects(()=>flow.login("u","p"),/Missing signed offline grant/);
 assert.equal(signedIn,false);
 assert.equal(activated,0);
});

test("desktop login fetches server-signed offline grant through authenticated client",async()=>{
 const {createDesktopLoginFlow}=require("../desktop-login-flow.cjs");
 const user={id:"user-001",role:"Operator"};
 let requested=0,authorized=null;
 const loginClient={login:async()=>user,logout:async()=>{},getSignedGrant:async()=>{requested++;return {grant:{userId:user.id,expiresAt:Date.now()+1000,permissions:["horses:read"]},signature:"aa",publicKey:publicKey.export({type:"spki",format:"pem"})};},withToken:async cb=>cb("server-token")};
 const flow=createDesktopLoginFlow({trustedPublicKey:publicKey,loginClient,offlineSessions:{logout(){},authorize(value){authorized=value;}}});
 await flow.login("staff","secret");
 assert.equal(requested,1);
 assert.equal(authorized.userId,user.id);
 assert.equal(authorized.publicKey.asymmetricKeyType,"ed25519");
});

test("desktop rejects an untrusted offline signing key",async()=>{
 const {createDesktopLoginFlow}=require("../desktop-login-flow.cjs");
 const other=crypto.generateKeyPairSync("ed25519").publicKey;
 let activated=0,logoutCount=0;
 const loginClient={login:async()=>({id:userId}),logout:async()=>{logoutCount++;},withToken:async cb=>cb("token")};
 const flow=createDesktopLoginFlow({trustedPublicKey:publicKey,loginClient,offlineSessions:{logout(){},authorize(){activated++;}},getSignedGrant:async()=>({grant:{userId},publicKey:other.export({type:"spki",format:"pem"}),signature:"aa"})});
 await assert.rejects(()=>flow.login("u","p"),/signing key mismatch/);
 assert.equal(activated,0);
 assert.ok(logoutCount>=2);
});
