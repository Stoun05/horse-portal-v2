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
