const {randomUUID,createHash}=require("node:crypto");
const fs=require("node:fs");
const {saveVault,loadVault,accountPath}=require("./offline-vault.cjs");
const {classifyServerResponse}=require("./sync-planner.cjs");
// Isolated prototype, not wired into the Electron renderer or plaintext SQLite.
function openAccountOfflineStore({root,userId,key}) {
 if(typeof root!=="string" || !Buffer.isBuffer(key) || key.length!==32) throw Error("Invalid configuration");
 const state=loadVault(root,userId,key)??{schema:1,horses:{},pending:[],lastSyncedAt:null};
 if(state.schema!==1 || !Array.isArray(state.pending) || typeof state.horses!=="object") throw Error("Invalid state");
 const filename=accountPath(root,userId);
 const fingerprint=()=>fs.existsSync(filename)?createHash("sha256").update(fs.readFileSync(filename)).digest("hex"):null;
 let loadedFingerprint=fingerprint();
 const persist=next=>{
  // Refuse stale writes from another open handle instead of discarding newer edits.
  // An exclusive lock closes the check-then-write race across Windows processes.
  // Never auto-remove an unknown lock: a failed write is safer than lost horse data.
  fs.mkdirSync(require("node:path").dirname(filename),{recursive:true,mode:0o700});
  const lockPath=filename+".lock";
  const lock=fs.openSync(lockPath,"wx",0o600);
  try {
   if(fingerprint()!==loadedFingerprint) throw Error("Offline vault changed since opening; reload account data");
   saveVault(root,userId,next,key);
   loadedFingerprint=fingerprint();
   Object.assign(state,next);
  } finally {
   fs.closeSync(lock);
   fs.unlinkSync(lockPath);
  }
 };
 return {
  listHorses:()=>structuredClone(state.horses),
  listPending:()=>structuredClone(state.pending),
  lastSyncedAt:()=>state.lastSyncedAt,
  addLocalChange({entityId,action,payload=null,baseVersion=null}) {
   if(typeof entityId!=="string" || !entityId || !["create","update","delete"].includes(action)) throw Error("Invalid change");
   if(action!=="delete" && (!payload || typeof payload!=="object" || Array.isArray(payload))) throw Error("Invalid payload");
   if(action==="create" ? baseVersion!==null : !Number.isInteger(baseVersion)||baseVersion<1) throw Error("Invalid version");
   // Until the server acknowledges the first edit, its resulting version is unknown.
   // Never queue a second edit to the same horse with a guessed base version.
   if(state.pending.some(item=>item.entity_id===entityId)) throw Error("Pending change for this horse must sync or be resolved first");
   const next=structuredClone(state), id=randomUUID();
   next.pending.push({id,entity_id:entityId,action,payload,base_version:baseVersion});
   if(action==="delete") delete next.horses[entityId];
   else next.horses[entityId]=structuredClone(payload);
   persist(next);
   return id;
  },
  markConflict(id) {
   const next=structuredClone(state), item=next.pending.find(x=>x.id===id);
   if(!item || item.status==="conflict") return false;
   item.status="conflict";
   persist(next);return true;
  },
  acknowledge(id,response) {
   const item=state.pending.find(x=>x.id===id);
   if(!item || item.status==="conflict" || classifyServerResponse(item,response)!=="ack") return false;
   const next=structuredClone(state);
   next.pending=next.pending.filter(x=>x.id!==id);
   persist(next);return true;
  }
 };
}
module.exports={openAccountOfflineStore};
