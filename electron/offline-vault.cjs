/* Prototype encrypted per-account offline object vault. Not yet used by UI. */
const fs=require("node:fs");
const path=require("node:path");
const {randomBytes,createCipheriv,createDecipheriv,createHash}=require("node:crypto");
function accountPath(root,userId){
 if(typeof userId!=="string" || !/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(userId)) throw Error("Invalid user ID");
 const folder=createHash("sha256").update(userId).digest("hex");
 return path.join(root,folder,"offline-vault.json");
}
function validateKey(key){if(!Buffer.isBuffer(key)||key.length!==32)throw Error("Expected 32-byte key");}
function encryptObject(object,key){
 validateKey(key);
 const iv=randomBytes(12),cipher=createCipheriv("aes-256-gcm",key,iv);
 const plaintext=Buffer.from(JSON.stringify(object),"utf8");
 const ciphertext=Buffer.concat([cipher.update(plaintext),cipher.final()]);
 return {v:1,iv:iv.toString("base64"),tag:cipher.getAuthTag().toString("base64"),data:ciphertext.toString("base64")};
}
function decryptObject(envelope,key){
 validateKey(key);
 if(!envelope||envelope.v!==1)throw Error("Invalid vault format");
 const decipher=createDecipheriv("aes-256-gcm",key,Buffer.from(envelope.iv,"base64"));
 decipher.setAuthTag(Buffer.from(envelope.tag,"base64"));
 return JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.data,"base64")),decipher.final()]).toString("utf8"));
}
function saveVault(root,userId,value,key){
 const filename=accountPath(root,userId);
 fs.mkdirSync(path.dirname(filename),{recursive:true,mode:0o700});
 const temporary=filename+"."+randomBytes(8).toString("hex")+".tmp";
 try {
  fs.writeFileSync(temporary,JSON.stringify(encryptObject(value,key)),{mode:0o600,flag:"wx"});
  fs.renameSync(temporary,filename);
 } finally {try{fs.unlinkSync(temporary)}catch{}}
}
function loadVault(root,userId,key){
 const filename=accountPath(root,userId);
 if(!fs.existsSync(filename))return null;
 return decryptObject(JSON.parse(fs.readFileSync(filename,"utf8")),key);
}
module.exports={accountPath,encryptObject,decryptObject,saveVault,loadVault};
