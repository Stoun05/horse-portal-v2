/* Main-process-only lifecycle. Authentication and grant issuance are not implemented here. */
function createOfflineSessionController({attach,ipcMain,webContents,expectedOrigin,safeStorage,root}){
 if(typeof attach!=="function"||!ipcMain||!webContents||typeof expectedOrigin!=="string"||typeof root!=="string")throw Error("Invalid offline session dependencies");
 let revoke=null;
 let lastIdentity=null;
 return Object.freeze({
  authorize({userId,publicKey,grant,signature}){
   if(webContents.isDestroyed?.()) throw Error("Desktop window closed");
   if(revoke){revoke();revoke=null;lastIdentity=null;}
   const close=attach({ipcMain,webContents,expectedOrigin,safeStorage,root,userId,publicKey,grant,signature});
   if(typeof close!=="function") throw Error("Offline session attach must return cleanup function");
   revoke=close;
   lastIdentity=userId;
  },
  logout(){if(revoke){const close=revoke;revoke=null;lastIdentity=null;close();}},
  getSessionStatus(){return Object.freeze({active:typeof revoke==="function",userId:lastIdentity});},
 });
}
module.exports={createOfflineSessionController};
