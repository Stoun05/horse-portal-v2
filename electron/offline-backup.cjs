/* Explicit encrypted backup and guarded restore; no plaintext export. */
const fs=require("node:fs");
const path=require("node:path");
const {randomBytes}=require("node:crypto");
const {accountPath,decryptObject}=require("./offline-vault.cjs");
function backupVault(root,userId,key,backupDir){
 const source=accountPath(root,userId);
 const encrypted=fs.readFileSync(source);
 // Fail before exporting any damaged or wrongly keyed data.
 decryptObject(JSON.parse(encrypted.toString("utf8")),key);
 fs.mkdirSync(backupDir,{recursive:true,mode:0o700});
 const target=path.join(backupDir,"account-"+randomBytes(12).toString("hex")+".backup.json");
 fs.writeFileSync(target,encrypted,{flag:"wx",mode:0o600});
 return target;
}
function restoreVault(root,userId,key,backupFile){
 const target=accountPath(root,userId);
 // Never silently overwrite current user data, even if damaged.
 if(fs.existsSync(target))throw Error("Current vault exists; manual recovery required");
 const encrypted=fs.readFileSync(backupFile);
 decryptObject(JSON.parse(encrypted.toString("utf8")),key);
 fs.mkdirSync(path.dirname(target),{recursive:true,mode:0o700});
 fs.writeFileSync(target,encrypted,{flag:"wx",mode:0o600});
 return true;
}
module.exports={backupVault,restoreVault};
