const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const {createWindowsKeyStore,keyPath}=require("../offline-key-store.cjs");
const user="53a25d93-52be-4cab-8fea-f344f9340c9a";
const mockSafeStorage={isEncryptionAvailable:()=>true,encryptString:x=>Buffer.from("protected:"+x),decryptString:x=>x.toString().replace(/^protected:/,"")};
test("key survives reopening and is never written in plaintext",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"horse-keys-"));
 try {
   const store=createWindowsKeyStore({root,safeStorage:mockSafeStorage,platform:"win32"});
   const a=store.loadOrCreate(user), b=store.loadOrCreate(user);
   assert.equal(a.length,32);assert.deepEqual(a,b);
   assert.equal(fs.readFileSync(keyPath(root,user)).includes(a.toString("hex")),false);
 } finally {fs.rmSync(root,{recursive:true,force:true});}
});
test("fails closed without Windows encryption",()=>{
 assert.throws(()=>createWindowsKeyStore({root:"C:\\data",safeStorage:{isEncryptionAvailable:()=>false},platform:"win32"}));
 assert.throws(()=>createWindowsKeyStore({root:"/tmp",safeStorage:mockSafeStorage,platform:"linux"}));
});
