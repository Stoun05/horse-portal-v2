/* Opt-in sequential sync engine. No networking or renderer access: caller supplies send(). */
const {planSync,classifyServerResponse}=require("./sync-planner.cjs");
async function flushPending({store,send}){
 if(!store?.listPending||!store?.acknowledge||!store?.markConflict||typeof send!=="function") throw Error("Invalid sync dependencies");
 let acknowledged=0,conflicted=0;
 for(const change of store.listPending()){
  if(change.status==="conflict") return {state:"conflict",acknowledged,conflicted};
  const request=planSync([change])[0];
  let response;
  try{response=await send(request);}catch{return {state:"retry",acknowledged,conflicted};}
  const disposition=classifyServerResponse(change,response);
  if(disposition==="ack"){
   if(!store.acknowledge(change.id,response)) return {state:"retry",acknowledged,conflicted};
   acknowledged++;
  }else if(disposition==="conflict"){
   store.markConflict(change.id);
   conflicted++;
   return {state:"conflict",acknowledged,conflicted};
  }else if(disposition==="blocked"){
   return {state:"blocked",acknowledged,conflicted};
  }else{
   return {state:"retry",acknowledged,conflicted};
  }
 }
 return {state:"complete",acknowledged,conflicted};
}
module.exports={flushPending};
