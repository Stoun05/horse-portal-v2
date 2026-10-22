/* Explicitly authorized, opt-in desktop session. Login and grant issuance happen elsewhere. */
const {openAuthorizedOfflineStore}=require("./authorized-offline-store.cjs");
const {registerOfflineReadIpc}=require("./offline-ipc.cjs");
function attachAuthorizedWindow({ipcMain,webContents,expectedOrigin,root,userId,safeStorage,publicKey,grant,signature,platform=process.platform}){
 if(!webContents || webContents.isDestroyed?.()) throw Error("Invalid desktop window");
 const store=openAuthorizedOfflineStore({root,userId,safeStorage,publicKey,grant,signature,platform});
 return registerOfflineReadIpc({ipcMain,store,expectedOrigin,expectedSender:webContents});
}
module.exports={attachAuthorizedWindow};
