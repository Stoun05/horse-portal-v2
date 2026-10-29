/* Main-process-only lifecycle. Authentication and grant issuance are not implemented here. */
function createOfflineSessionController({attach,ipcMain,webContents,expectedOrigin,safeStorage,root,sendSync,fetchServerHorses,fetchServerDeletions}){
 if(typeof attach!=="function"||!ipcMain||!webContents||typeof expectedOrigin!=="string"||typeof root!=="string")throw Error("Invalid offline session dependencies");
 let revoke=null;
 let lastIdentity=null;
 let syncAbort=new AbortController();
 let disposed=false;
 const endSession=()=>{
  syncAbort.abort();
  if(revoke){const close=revoke;revoke=null;lastIdentity=null;close();}
 };
 for(const event of ["destroyed","did-start-navigation","render-process-gone"]){
  webContents.on?.(event,endSession);
 }
 return Object.freeze({
  authorize({userId,publicKey,grant,signature}){
   if(disposed || webContents.isDestroyed?.()) throw Error("Desktop window closed");
   endSession();
   syncAbort=new AbortController();
   const close=attach({ipcMain,webContents,expectedOrigin,safeStorage,root,userId,publicKey,grant,signature,sendSync,fetchServerHorses,fetchServerDeletions,getSyncSignal:()=>syncAbort.signal});
   if(typeof close!=="function") {
    syncAbort.abort();
    throw Error("Offline session attach must return cleanup function");
   }
   revoke=close;
   lastIdentity=userId;
  },
  logout(){endSession();},
  dispose(){
   if(disposed)return;
   disposed=true;
   endSession();
   for(const event of ["destroyed","did-start-navigation","render-process-gone"]){
    webContents.removeListener?.(event,endSession);
   }
  },
  getSyncSignal(){if(!revoke) throw Error("Offline session not authorized");return syncAbort.signal;},
  getSessionStatus(){return Object.freeze({active:typeof revoke==="function",userId:lastIdentity});},
 });
}
module.exports={createOfflineSessionController};
