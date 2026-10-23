/* Opt-in session bridge; never authenticates a user or issues a signing grant. */
const {openAuthorizedOfflineStore}=require("./authorized-offline-store.cjs");
const {registerOfflineReadIpc}=require("./offline-ipc.cjs");
const activeIpcSessions=new WeakSet();
const {flushPending}=require("./sync-runner.cjs");
function attachAuthorizedWindow({ipcMain,webContents,expectedOrigin,root,userId,safeStorage,publicKey,grant,signature,sendSync,getSyncSignal,platform=process.platform}){
 if(!webContents || webContents.isDestroyed?.() || typeof webContents.on!=="function" || typeof webContents.removeListener!=="function") throw Error("Invalid desktop window");
 if(activeIpcSessions.has(ipcMain)) throw Error("Offline IPC session already active");
 const store=openAuthorizedOfflineStore({root,userId,safeStorage,publicKey,grant,signature,platform});
 const sync=typeof sendSync==="function" && typeof getSyncSignal==="function"
  ?()=>flushPending({store,send:sendSync,signal:getSyncSignal()}) : undefined;
 const revokeIpc=registerOfflineReadIpc({ipcMain,store,expectedOrigin,expectedSender:webContents,sync});
 activeIpcSessions.add(ipcMain);
 let active=true;
 const revoke=()=>{
  if(!active)return;
  active=false;
  activeIpcSessions.delete(ipcMain);
  try {
   for(const event of ["did-navigate","did-start-navigation","render-process-gone","destroyed"]){
    try { webContents.removeListener(event,revoke); } catch { /* still revoke IPC */ }
   }
  } finally { revokeIpc(); }
 };
 // A new document or crashed renderer needs a fresh user authorization.
 try {
  webContents.on("did-navigate",revoke);
  webContents.on("did-start-navigation",revoke);
  webContents.on("render-process-gone",revoke);
  webContents.on("destroyed",revoke);
  if(webContents.isDestroyed?.()) throw Error("Desktop window destroyed during authorization");
 } catch(error) {
  revoke();
  throw error;
 }
 return revoke;
}
module.exports={attachAuthorizedWindow};
