/* Opt-in session bridge; never authenticates a user or issues a signing grant. */
const {openAuthorizedOfflineStore}=require("./authorized-offline-store.cjs");
const {registerOfflineReadIpc}=require("./offline-ipc.cjs");
function attachAuthorizedWindow({ipcMain,webContents,expectedOrigin,root,userId,safeStorage,publicKey,grant,signature,platform=process.platform}){
 if(!webContents || webContents.isDestroyed?.() || typeof webContents.on!=="function" || typeof webContents.removeListener!=="function") throw Error("Invalid desktop window");
 const store=openAuthorizedOfflineStore({root,userId,safeStorage,publicKey,grant,signature,platform});
 const revokeIpc=registerOfflineReadIpc({ipcMain,store,expectedOrigin,expectedSender:webContents});
 let active=true;
 const revoke=()=>{
  if(!active)return;
  active=false;
  webContents.removeListener("did-navigate",revoke);
  webContents.removeListener("render-process-gone",revoke);
  webContents.removeListener("destroyed",revoke);
  revokeIpc();
 };
 // A new document or crashed renderer needs a fresh user authorization.
 webContents.on("did-navigate",revoke);
 webContents.on("render-process-gone",revoke);
 webContents.on("destroyed",revoke);
 if(webContents.isDestroyed?.()) {revoke();throw Error("Desktop window destroyed during authorization");}
 return revoke;
}
module.exports={attachAuthorizedWindow};
