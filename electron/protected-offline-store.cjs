/* Opt-in integration: safeStorage key plus per-account encrypted outbox. */
const {createWindowsKeyStore}=require("./offline-key-store.cjs");
const {openAccountOfflineStore}=require("./account-offline-store.cjs");
const {accountPath}=require("./offline-vault.cjs");
const {keyPath}=require("./offline-key-store.cjs");
const fs=require("node:fs");
function openProtectedOfflineStore({root,userId,safeStorage,platform=process.platform}) {
 // Never generate a replacement key when a vault exists but its key is missing.
 const hasVault=fs.existsSync(accountPath(root,userId));
 const hasKey=fs.existsSync(keyPath(root,userId));
 if(hasVault && !hasKey) throw Error("Encrypted vault exists but its key is missing; recovery required");
 const keyStore=createWindowsKeyStore({root,safeStorage,platform});
 const key=keyStore.loadOrCreate(userId);
 return openAccountOfflineStore({root,userId,key});
}
module.exports={openProtectedOfflineStore};
