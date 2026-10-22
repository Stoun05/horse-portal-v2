const {randomUUID}=require("node:crypto");
const {saveVault,loadVault}=require("./offline-vault.cjs");
// Isolated prototype, not wired into the Electron renderer or plaintext SQLite.
function openAccountOfflineStore({root,userId,key}) {
 if(typeof root!=="string" || !Buffer.isBuffer(key) || key.length!==32) throw Error("Invalid configuration");
 const state=loadVault(root,userId,key)??{schema:1,horses:{},pending:[],lastSyncedAt:null};
 if(state.schema!==1 || !Array.isArray(state.pending) || typeof state.horses!=="object") throw Error("Invalid state");
 const persist=next=>{saveVault(root,userId,next,key);Object.assign(state,next);};
 return {
  listHorses:()=>structuredClone(state.horses),
  listPending:()=>structuredClone(state.pending),
  addLocalChange({entityId,action,payload=null,baseVersion=null}) {
   if(typeof entityId!=="string" || !entityId || !["create","update","delete"].includes(action)) throw Error("Invalid change");
   if(action!=="delete" && (!payload || typeof payload!=="object" || Array.isArray(payload))) throw Error("Invalid payload");
   if(action==="create" ? baseVersion!==null : !Number.isInteger(baseVersion)||baseVersion<1) throw Error("Invalid version");
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
  acknowledge(id) {
   const next=structuredClone(state),before=next.pending.length;
   next.pending=next.pending.filter(x=>x.id!==id || x.status==="conflict");
   if(next.pending.length===before) return false;
   persist(next);return true;
  }
 };
}
module.exports={openAccountOfflineStore};
