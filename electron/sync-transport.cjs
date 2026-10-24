/* Opt-in transport for the local PostgreSQL sync endpoint. No credentials on disk. */
function createHorseSyncSender({baseUrl="http://127.0.0.1:4100",token,fetchImpl=fetch,timeoutMs=10000}){
 const url=new URL(baseUrl);
 if(url.protocol!=="http:" || !["127.0.0.1","localhost"].includes(url.hostname) || url.username || url.password || url.pathname!=="/" || url.search || url.hash) throw Error("Only local HTTP server supported");
 if(!/^[a-f0-9]{64}$/.test(token??"")) throw Error("Invalid session token");
 if(typeof fetchImpl!=="function" || !Number.isInteger(timeoutMs) || timeoutMs<100 || timeoutMs>60000) throw Error("Invalid transport");
 const endpoint=new URL("/api/sync/horses",url);
 return async function send(change){
  const response=await fetchImpl(endpoint,{
   method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},
   body:JSON.stringify(change),cache:"no-store",signal:AbortSignal.timeout(timeoutMs)
  });
  if(response.status===401||response.status===403) return {changeId:change.changeId,status:"forbidden"};
  if(response.status!==200&&response.status!==409) return null;
  const body=await response.json();
  if(!body||typeof body!=="object"||body.changeId!==change.changeId) return null;
  if(response.status===200&&body.status==="accepted") return {changeId:body.changeId,status:"accepted",serverVersion:body.serverVersion};
  if(response.status===409&&body.status==="conflict") return {changeId:body.changeId,status:"conflict",serverVersion:body.serverVersion};
  return null;
 };
}
module.exports={createHorseSyncSender};
