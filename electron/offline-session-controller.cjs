/* Main-process-only lifecycle. Authentication and grant issuance are not implemented here. */
function createOfflineSessionController({attach,ipcMain,webContents,expectedOrigin,safeStorage,root}){
 if(typeof attach!=="function"||!ipcMain||!webContents||typeof expectedOrigin!=="string"||typeof root!=="string")throw Error("Invalid offline session dependencies");
 let revoke=null;
 return Object.freeze({
  authorize({userId,publicKey,grant,signature}){
   if(revoke){revoke();revoke=null;}
   revoke=attach({ipcMain,webContents,expectedOrigin,safeStorage,root,userId,publicKey,grant,signature});
  },
  logout(){if(revoke){const close=revoke;revoke=null;close();}},
 });
}
module.exports={createOfflineSessionController};
