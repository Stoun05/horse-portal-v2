const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const {randomBytes}=require("node:crypto");
const {saveVault,loadVault,accountPath}=require("../offline-vault.cjs");
const a="53a25d93-52be-4cab-8fea-f344f9340c9a",b="75d5ab33-bb19-42d3-a676-813835c55d02";
test("account vault persists encrypted and cannot be opened with another key",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"atcylyk-vault-")), key=randomBytes(32);
 try{
  saveVault(root,a,{horses:[{name:"Akýol"}],pending:[1]},key);
  const raw=fs.readFileSync(accountPath(root,a),"utf8");
  assert.equal(raw.includes("Akýol"),false);
  assert.equal(loadVault(root,a,key).horses[0].name,"Akýol");
  assert.throws(()=>loadVault(root,a,randomBytes(32)));
  assert.equal(loadVault(root,b,key),null);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
test("tampered ciphertext is rejected",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"atcylyk-vault-")),key=randomBytes(32);
 try{
  saveVault(root,a,{test:true},key);
  const filename=accountPath(root,a),envelope=JSON.parse(fs.readFileSync(filename,"utf8"));
  envelope.data=Buffer.from("altered").toString("base64");
  fs.writeFileSync(filename,JSON.stringify(envelope));
  assert.throws(()=>loadVault(root,a,key));
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
