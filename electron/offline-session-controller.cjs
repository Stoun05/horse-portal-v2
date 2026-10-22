/* Main-process-only lifecycle. Authentication and grant issuance are not implemented here. */
function createOfflineSessionController({attach,ipcMain,webContents,expectedOrigin,safeStorage,root}){
 if(typeof attach!=="function"||!ipcMain||!webContents||typeof expectedOrigin!=="string"||typeof root!=="string")throw Error("Invalid offline session dependencies");
 let revoke=null;
 let lastIdentity=null;
 let syncAbort=new AbortController();
 return Object.freeze({
  authorize({userId,publicKey,grant,signature}){
   if(webContents.isDestroyed?.()) throw Error("Desktop window closed");
   syncAbort.abort();
   if(revoke){const closePrevious=revoke;revoke=null;lastIdentity=null;closePrevious();}
   syncAbort=new AbortController();
   const close=attach({ipcMain,webContents,expectedOrigin,safeStorage,root,userId,publicKey,grant,signature});
   if(typeof close!=="function") {
    syncAbort.abort();
    throw Error("Offline session attach must return cleanup function");
   }
   revoke=close;
   lastIdentity=userId;
  },
  logout(){syncAbort.abort();if(revoke){const close=revoke;revoke=null;lastIdentity=null;close();}},
  getSyncSignal(){if(!revoke) throw Error("Offline session not authorized");return syncAbort.signal;},
  getSessionStatus(){return Object.freeze({active:typeof revoke==="function",userId:lastIdentity});},
 });
}
module.exports={createOfflineSessionController};
