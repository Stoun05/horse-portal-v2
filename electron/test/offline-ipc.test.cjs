const test = require("node:test");
const assert = require("node:assert/strict");
const { trustedSender, registerOfflineReadIpc } = require("../offline-ipc.cjs");
test("IPC rejects unrelated pages and subframes", () => {
  const mainFrame = { url: "http://127.0.0.1:4444/atlar" };
  const sender = { mainFrame };
  assert.equal(trustedSender({ sender, senderFrame: mainFrame }, "http://127.0.0.1:4444"), true);
  assert.equal(trustedSender({ sender, senderFrame: { url: "http://127.0.0.1:4444/" } }, "http://127.0.0.1:4444"), false);
  assert.equal(trustedSender({ sender, senderFrame: mainFrame }, "http://127.0.0.1:5555"), false);
  assert.equal(trustedSender({ sender, senderFrame: { url: "https://evil.invalid/" } }, "http://127.0.0.1:4444"), false);
});
test("only constrained read-only channels are registered", async () => {
  const handlers = new Map();
  const ipcMain = { handle(name, fn) { handlers.set(name, fn); }, removeHandler(name) { handlers.delete(name); } };
  const store = { listHorses: () => [{ id: "a" }], listPending: () => [{ id: "pending" }], lastSyncedAt: () => null };
  const cleanup = registerOfflineReadIpc({ ipcMain, store, expectedOrigin: "http://127.0.0.1:4444" });
  assert.equal(handlers.size, 3);
  const frame = { url: "http://127.0.0.1:4444/" };
  const event = { sender: { mainFrame: frame }, senderFrame: frame };
  assert.deepEqual(await handlers.get("offline:status")(event), { lastSyncedAt: null, pendingCount: 1 });
  assert.deepEqual(await handlers.get("offline:horses")(event), [{ id: "a" }]);
  await assert.rejects(() => handlers.get("offline:horses")({ senderFrame: { url: "https://other.invalid" }, sender: { mainFrame: frame } }), /Forbidden/);
  cleanup();
  assert.equal(handlers.size, 0);
});


test("cleanup preserves unrelated IPC channels",()=>{
 const handlers=new Map([["unrelated:channel",()=> "untouched"]]);
 const ipcMain={handle:(name,handler)=>handlers.set(name,handler),removeHandler:name=>handlers.delete(name)};
 const store={listHorses:()=>({}),listPending:()=>[],lastSyncedAt:()=>null};
 const close=registerOfflineReadIpc({ipcMain,store,expectedOrigin:"http://127.0.0.1:4444"});
 assert.equal(handlers.size,4);
 close();
 assert.deepEqual([...handlers.keys()],["unrelated:channel"]);
 assert.equal(handlers.get("unrelated:channel")(),"untouched");
});

test("optional horse IPC channels are registered only when capabilities exist",async()=>{
 const handlers=new Map(),frame={url:"http://127.0.0.1:4444/atlar"},sender={mainFrame:frame};
 const event={sender,senderFrame:frame};
 const ipcMain={handle:(name,handler)=>handlers.set(name,handler),removeHandler:name=>handlers.delete(name)};
 const versions={horseA:2};
 const store={
  listHorses:()=>({}),listPending:()=>[],lastSyncedAt:()=>null,
  listHorseVersions:()=>versions,addLocalChange:()=> "queued"
 };
 let syncCalls=0,importCalls=0;
 const close=registerOfflineReadIpc({
  ipcMain,store,expectedOrigin:"http://127.0.0.1:4444",expectedSender:sender,
  sync:async()=>{syncCalls++;return {accepted:1};},
  importHorses:async()=>{importCalls++;return {imported:1};}
 });
 assert.deepEqual([...handlers.keys()].sort(),[
  "offline:status","offline:horses","offline:horse-versions","offline:sync",
  "offline:import-horses","offline:pending-count","offline:create-horse",
  "offline:update-horse","offline:delete-horse"
 ].sort());
 assert.deepEqual(await handlers.get("offline:horse-versions")(event),versions);
 assert.deepEqual(await handlers.get("offline:sync")(event),{accepted:1});
 assert.deepEqual(await handlers.get("offline:import-horses")(event),{imported:1});
 await assert.rejects(()=>handlers.get("offline:sync")({sender:{mainFrame:frame},senderFrame:frame}),/Forbidden IPC window/);
 assert.equal(syncCalls,1);
 assert.equal(importCalls,1);
 close();
 assert.equal(handlers.size,0);
});

test("pinned offline IPC refuses a different window on the same origin",async()=>{
 const handlers=new Map();
 const ipcMain={handle:(name,fn)=>handlers.set(name,fn),removeHandler:name=>handlers.delete(name)};
 const mainFrame={url:"http://127.0.0.1:4444/atlar"};
 const expectedSender={mainFrame};
 const otherFrame={url:"http://127.0.0.1:4444/atlar"};
 const otherSender={mainFrame:otherFrame};
 const store={listHorses:()=>({}),listPending:()=>[],lastSyncedAt:()=>null};
 const cleanup=registerOfflineReadIpc({ipcMain,store,expectedOrigin:"http://127.0.0.1:4444",expectedSender});
 assert.deepEqual(await handlers.get("offline:horses")({sender:expectedSender,senderFrame:mainFrame}),{});
 await assert.rejects(()=>handlers.get("offline:horses")({sender:otherSender,senderFrame:otherFrame}),/Forbidden IPC window/);
 cleanup();
});

test("offline IPC cleanup can be called repeatedly",()=>{
 const handlers=new Map();
 const ipcMain={handle:(name,fn)=>handlers.set(name,fn),removeHandler:name=>handlers.delete(name)};
 const store={listHorses:()=>({}),listPending:()=>[],lastSyncedAt:()=>null};
 const close=registerOfflineReadIpc({ipcMain,store,expectedOrigin:"http://127.0.0.1:4444"});
 assert.equal(handlers.size,3);
 close();close();
 assert.equal(handlers.size,0);
});

test("captured IPC handler denies reads after session is closed",async()=>{
 const handlers=new Map();
 const ipcMain={handle:(name,fn)=>handlers.set(name,fn),removeHandler:name=>handlers.delete(name)};
 const store={listHorses:()=>({}),listPending:()=>[],lastSyncedAt:()=>null};
 const close=registerOfflineReadIpc({ipcMain,store,expectedOrigin:"http://127.0.0.1:4444"});
 const heldHandler=handlers.get("offline:horses");
 const frame={url:"http://127.0.0.1:4444/atlar"};
 const event={sender:{mainFrame:frame},senderFrame:frame};
 close();
 await assert.rejects(()=>heldHandler(event),/session closed/);
});

test("destroying authorized Electron window revokes its offline read IPC",async()=>{
 const {EventEmitter}=require("node:events");
 const sender=new EventEmitter();
 const frame={url:"http://127.0.0.1:4444/atlar"};
 sender.mainFrame=frame;
 const handlers=new Map();
 const ipcMain={handle:(name,fn)=>handlers.set(name,fn),removeHandler:name=>handlers.delete(name)};
 const store={listHorses:()=>({horse:{name:"Akýol"}}),listPending:()=>[],lastSyncedAt:()=>null};
 const cleanup=registerOfflineReadIpc({ipcMain,store,expectedOrigin:"http://127.0.0.1:4444",expectedSender:sender});
 const saved=handlers.get("offline:horses");
 assert.equal((await saved({sender,senderFrame:frame})).horse.name,"Akýol");
 sender.emit("destroyed");
 assert.equal(handlers.size,0);
 await assert.rejects(()=>saved({sender,senderFrame:frame}),/session closed/);
 cleanup();
});

test("IPC setup fails closed for already destroyed Electron window",()=>{
 const handlers=new Map(),sender={isDestroyed:()=>true};
 const ipcMain={handle:(n,fn)=>handlers.set(n,fn),removeHandler:n=>handlers.delete(n)};
 const store={listHorses:()=>({}),listPending:()=>[],lastSyncedAt:()=>null};
 assert.throws(()=>registerOfflineReadIpc({ipcMain,store,expectedOrigin:"http://127.0.0.1:4444",expectedSender:sender}),/already destroyed/);
 assert.equal(handlers.size,0);
});
test("partial IPC registration failure removes previously added handlers",()=>{
 const handlers=new Map();
 const ipcMain={
  handle:(n,fn)=>{if(n==="offline:horses")throw Error("Registration failed");handlers.set(n,fn);},
  removeHandler:n=>handlers.delete(n)
 };
 const store={listHorses:()=>({}),listPending:()=>[],lastSyncedAt:()=>null};
 assert.throws(()=>registerOfflineReadIpc({ipcMain,store,expectedOrigin:"http://127.0.0.1:4444"}),/Registration failed/);
 assert.equal(handlers.size,0);
});

test("offline preload has read-only methods and no write or generic invoke bridge",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const source=fs.readFileSync(path.join(__dirname,"..","offline-preload.cjs"),"utf8");
 assert.match(source,/getStatus/);
 assert.match(source,/listHorses/);
 assert.match(source,/getPendingCount/);
 assert.doesNotMatch(source,/addLocalChange|flushPending|sendSync/);
});

test("main process never exposes offline authorization to renderer or BrowserWindow",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const source=fs.readFileSync(path.join(__dirname,"..","main.cjs"),"utf8");
 assert.match(source,/attachAuthorizedWindow/);
 assert.match(source,/createOfflineSessionController/);
 assert.match(source,/offlineSessions\.dispose\(\)/);
 assert.doesNotMatch(source,/window\.authorizeOfflineAccount\s*=/);
 assert.doesNotMatch(source,/ipcMain\.handle\(\s*["']offline:authorize/);
});

test("main process owns pinned desktop login without a renderer login IPC",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const main=fs.readFileSync(path.join(__dirname,"../main.cjs"),"utf8");
 assert.match(main,/createDesktopLoginFlow/);
 assert.match(main,/PORTAL_OFFLINE_TRUSTED_PUBLIC_KEY_PEM/);
 assert.match(main,/desktopLogin\.logout\(\)/);
 assert.doesNotMatch(main,/ipcMain\.handle\(["'](?:offline:login|auth:login)/);
});

test("desktop authentication IPC accepts only original main frame and returns no token",async()=>{
 const {EventEmitter}=require("node:events");
 const {registerDesktopAuthIpc}=require("../desktop-auth-ipc.cjs");
 const sender=new EventEmitter(),frame={url:"http://127.0.0.1:4444/atlar"};
 sender.mainFrame=frame;
 const event={sender,senderFrame:frame},handlers=new Map();
 const ipcMain={handle:(n,fn)=>handlers.set(n,fn),removeHandler:n=>handlers.delete(n)};
 const flow={login:async()=>({id:"staff",username:"staff",role:"Operator",token:"SECRET"}),logout:async()=>{}};
 const close=registerDesktopAuthIpc({ipcMain,webContents:sender,expectedOrigin:"http://127.0.0.1:4444",loginFlow:flow,getSession:()=>({user:{id:"staff",role:"Operator"}})});
 const result=await handlers.get("desktop-auth:login")(event,{username:"staff",password:"p"});
 assert.deepEqual(result,{id:"staff",username:"staff",role:"Operator"});
 await assert.rejects(()=>handlers.get("desktop-auth:login")({sender:{mainFrame:frame},senderFrame:frame},{username:"staff",password:"p"}),/Forbidden/);
 await assert.rejects(()=>handlers.get("desktop-auth:login")(event,{username:"staff",password:"p",token:"fake"}),/Invalid credentials/);
 close();
 assert.equal(handlers.size,0);
});

test("offline horse creation validates input and delegates permission checks to store",async()=>{
 const {randomUUID}=require("node:crypto");
 const handlers=new Map(),frame={url:"http://127.0.0.1:4444/atlar"};
 const sender={mainFrame:frame},event={sender,senderFrame:frame};
 const ipcMain={handle:(name,fn)=>handlers.set(name,fn),removeHandler:name=>handlers.delete(name)};
 let saved=null;
 const store={listHorses:()=>({}),listPending:()=>[],lastSyncedAt:()=>null,addLocalChange:change=>{saved=change;return "pending-1";}};
 const close=registerOfflineReadIpc({ipcMain,store,expectedOrigin:"http://127.0.0.1:4444",expectedSender:sender});
 const id=randomUUID();
 assert.deepEqual(await handlers.get("offline:create-horse")(event,{entityId:id,payload:{name:"Akyol",code:"AT-1"}}),{changeId:"pending-1"});
 assert.deepEqual(saved,{entityId:id,action:"create",payload:{name:"Akyol",code:"AT-1"},baseVersion:null});
 await assert.rejects(()=>handlers.get("offline:create-horse")(event,{entityId:id,payload:{name:"Akyol",code:"AT-1",admin:true}}),/Invalid horse data/);
 await assert.rejects(()=>handlers.get("offline:create-horse")(event,{entityId:id,payload:{name:"",code:"AT-1"}}),/Invalid horse data/);
 await assert.rejects(()=>handlers.get("offline:create-horse")({sender:{mainFrame:frame},senderFrame:frame},{entityId:id,payload:{name:"Akyol",code:"AT-1"}}),/Forbidden IPC window/);
 close();assert.equal(handlers.size,0);
});

test("offline update and delete require known server version and pinned sender",async()=>{
 const {randomUUID}=require("node:crypto");
 const handlers=new Map(),frame={url:"http://127.0.0.1:4444/atlar"},sender={mainFrame:frame};
 const event={sender,senderFrame:frame},changes=[];
 const ipcMain={handle:(n,fn)=>handlers.set(n,fn),removeHandler:n=>handlers.delete(n)};
 const store={listHorses:()=>({}),listPending:()=>[],lastSyncedAt:()=>null,addLocalChange:c=>{changes.push(c);return "queued";}};
 const close=registerOfflineReadIpc({ipcMain,store,expectedOrigin:"http://127.0.0.1:4444",expectedSender:sender});
 const entityId=randomUUID();
 await assert.rejects(()=>handlers.get("offline:update-horse")(event,{entityId,baseVersion:0,payload:{name:"Akyol",code:"AT-1"}}),/Invalid horse update/);
 await assert.rejects(()=>handlers.get("offline:delete-horse")(event,{entityId,baseVersion:null}),/Invalid horse delete/);
 await assert.rejects(()=>handlers.get("offline:delete-horse")({sender:{mainFrame:frame},senderFrame:frame},{entityId,baseVersion:1}),/Forbidden IPC window/);
 await handlers.get("offline:update-horse")(event,{entityId,baseVersion:2,payload:{name:"Akyol",code:"AT-1"}});
 await handlers.get("offline:delete-horse")(event,{entityId,baseVersion:3});
 assert.deepEqual(changes.map(c=>[c.action,c.baseVersion]),[["update",2],["delete",3]]);
 close();
 assert.equal(handlers.size,0);
});

test("offline horse codes are unique and use server field lengths",async()=>{
 const {randomUUID}=require("node:crypto");
 const frame={url:"http://127.0.0.1:4444/atlar"},sender={mainFrame:frame},event={sender,senderFrame:frame},handlers=new Map();
 const horses={"existing":{name:"Akýol",code:"AT-001"}};
 const store={listHorses:()=>horses,listPending:()=>[],lastSyncedAt:()=>null,addLocalChange:()=>randomUUID()};
 const ipcMain={handle:(n,fn)=>handlers.set(n,fn),removeHandler:n=>handlers.delete(n)};
 const close=registerOfflineReadIpc({ipcMain,store,expectedOrigin:"http://127.0.0.1:4444",expectedSender:sender});
 const create=handlers.get("offline:create-horse"),id=randomUUID();
 await assert.rejects(()=>create(event,{entityId:id,payload:{name:"Different",code:" at-001 "}}),/code already exists/);
 await assert.rejects(()=>create(event,{entityId:id,payload:{name:"A",code:""}}),/Invalid horse data/);
 await assert.rejects(()=>create(event,{entityId:id,payload:{name:"A".repeat(151),code:"AT-9"}}),/Invalid horse data/);
 const result=await create(event,{entityId:id,payload:{name:" Akýol ",code:" AT-009 "}});
 assert.equal(typeof result.changeId,"string");
 close();
});

test("server horse import is limited to the authenticated desktop window",async()=>{
 const handlers=new Map(),frame={url:"http://127.0.0.1:4444/atlar"},sender={mainFrame:frame};
 const ipcMain={handle:(n,fn)=>handlers.set(n,fn),removeHandler:n=>handlers.delete(n)};
 let calls=0;
 const store={listHorses:()=>({}),listPending:()=>[],lastSyncedAt:()=>null};
 const close=registerOfflineReadIpc({ipcMain,store,expectedOrigin:"http://127.0.0.1:4444",expectedSender:sender,importHorses:async()=>{calls++;return {imported:2,skipped:1};}});
 const handler=handlers.get("offline:import-horses");
 assert.deepEqual(await handler({sender,senderFrame:frame}),{imported:2,skipped:1});
 await assert.rejects(()=>handler({sender:{mainFrame:frame},senderFrame:frame}),/Forbidden IPC window/);
 assert.equal(calls,1);
 close();
 await assert.rejects(()=>handler({sender,senderFrame:frame}),/session closed/);
});
