const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const {randomBytes}=require("node:crypto");
const {saveVault,loadVault,accountPath}=require("../offline-vault.cjs");
const {backupVault,restoreVault}=require("../offline-backup.cjs");
const user="53a25d93-52be-4cab-8fea-f344f9340c9a";
test("encrypted backup can restore without overwriting current data",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"horse-restore-")),key=randomBytes(32);
 try{
  saveVault(root,user,{horses:{one:{name:"Akyol"}},pending:[{id:"op-1"}]},key);
  const backup=backupVault(root,user,key,path.join(root,"backups"));
  assert.equal(fs.readFileSync(backup,"utf8").includes("Akyol"),false);
  assert.throws(()=>restoreVault(root,user,key,backup),/exists/);
  fs.unlinkSync(accountPath(root,user));
  assert.equal(restoreVault(root,user,key,backup),true);
  assert.equal(loadVault(root,user,key).horses.one.name,"Akyol");
  assert.equal(loadVault(root,user,key).pending.length,1);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test("wrong encryption key rejects backup",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"horse-badkey-")),key=randomBytes(32);
 try{
  saveVault(root,user,{horses:{}},key);
  assert.throws(()=>backupVault(root,user,randomBytes(32),path.join(root,"backups")));
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
