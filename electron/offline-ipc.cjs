/* Registration is opt-in until authenticated renderer and encrypted per-user storage exist. */
const CHANNELS = Object.freeze({
  status: "offline:status",
  horses: "offline:horses",
  versions: "offline:horse-versions",
  sync: "offline:sync",
  importHorses: "offline:import-horses",
  pendingCount: "offline:pending-count",
  createHorse: "offline:create-horse",
  updateHorse: "offline:update-horse",
  deleteHorse: "offline:delete-horse",
});
const IPC_NAMES = Object.freeze(Object.values(CHANNELS));
function trustedSender(event, expectedOrigin) {
  if (typeof expectedOrigin !== "string" || !/^http:\/\/127\.0\.0\.1:\d+$/.test(expectedOrigin)) return false;
  if (!event?.senderFrame || event.senderFrame !== event.sender?.mainFrame) return false;
  try { return new URL(event.senderFrame.url).origin === expectedOrigin; }
  catch { return false; }
}
function registerOfflineReadIpc({ ipcMain, store, expectedOrigin, expectedSender, sync, importHorses }) {
  if (!ipcMain?.handle || !store?.listHorses || !store?.listPending || !store?.lastSyncedAt)
    throw new Error("Invalid dependencies");
  if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(expectedOrigin)) throw new Error("Invalid local origin");
  let active=true;
  const closeOnDestroyed=()=>cleanup();
  const cleanup=()=>{
    if(!active)return;
    active=false;
    expectedSender?.removeListener?.("destroyed",closeOnDestroyed);
    IPC_NAMES.forEach(channel=>ipcMain.removeHandler(channel));
  };
  if(expectedSender?.isDestroyed?.()) throw new Error("Offline IPC window already destroyed");
  expectedSender?.once?.("destroyed",closeOnDestroyed);
  const check = (event) => {
    if(!active) throw new Error("Offline IPC session closed");
    if (expectedSender && event?.sender !== expectedSender) throw new Error("Forbidden IPC window");
    if (!trustedSender(event, expectedOrigin)) throw new Error("Forbidden IPC sender");
  };
  try {
  ipcMain.handle(CHANNELS.status, async (event) => {
    check(event);
    return { lastSyncedAt: store.lastSyncedAt(), pendingCount: store.listPending().length };
  });
  ipcMain.handle(CHANNELS.horses, async (event) => {
    check(event);
    return store.listHorses();
  });
  if(typeof store.listHorseVersions==="function") ipcMain.handle(CHANNELS.versions, async (event)=>{
    check(event);return store.listHorseVersions();
  });
  ipcMain.handle(CHANNELS.pendingCount, async (event) => {
    check(event);
    return store.listPending().length;
  });
  if(typeof sync==="function")ipcMain.handle(CHANNELS.sync,async(event)=>{check(event);return sync();});
  if(typeof importHorses==="function")ipcMain.handle(CHANNELS.importHorses,async(event)=>{check(event);return importHorses();});
  const normalizeHorse=payload=>{
    if(!payload||typeof payload!=="object"||Array.isArray(payload))throw Error("Invalid horse data");
    const allowed=new Set(["name","code","breed","sex","year","color","father","mother","description"]);
    if(Object.keys(payload).some(key=>!allowed.has(key)))throw Error("Invalid horse data");
    if(typeof payload.name!=="string"||typeof payload.code!=="string")throw Error("Invalid horse data");
    const name=payload.name.trim(),code=payload.code.trim();
    if(!name||name.length>150||!code||code.length>64)throw Error("Invalid horse data");
    const normalized={name,code};
    for(const [key,max] of [["breed",100],["sex",40],["color",100],["father",150],["mother",150],["description",2000]]){
      if(payload[key]===undefined)continue;
      if(typeof payload[key]!=="string"||payload[key].length>max)throw Error("Invalid horse data");
      normalized[key]=payload[key].trim();
    }
    if(payload.year!==undefined){
      if(!Number.isInteger(payload.year)||payload.year<1800||payload.year>2200)throw Error("Invalid horse data");
      normalized.year=payload.year;
    }
    return normalized;
  };
  const ensureUniqueCode=(code,exceptId)=>{
    const existing=store.listHorses();
    if(Object.entries(existing).some(([id,horse])=>id!==exceptId&&typeof horse?.code==="string"&&horse.code.trim().toLocaleLowerCase("tk")===code.toLocaleLowerCase("tk")))throw Error("Horse code already exists");
  };
  if(typeof store.addLocalChange==="function") ipcMain.handle(CHANNELS.createHorse,async(event,input)=>{
    check(event);
    if(!input||typeof input!=="object"||Array.isArray(input)||Object.keys(input).sort().join(",")!=="entityId,payload")throw Error("Invalid horse create request");
    const {entityId,payload}=input;
    if(typeof entityId!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(entityId))throw Error("Invalid horse ID");
    const normalized=normalizeHorse(payload);
    ensureUniqueCode(normalized.code);
    return {changeId:store.addLocalChange({entityId,action:"create",payload:normalized,baseVersion:null})};
  });
  if(typeof store.addLocalChange==="function"){
   const validId=id=>typeof id==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
   const validVersion=v=>Number.isSafeInteger(v)&&v>=1;
   ipcMain.handle(CHANNELS.updateHorse,async(event,input)=>{
    check(event);
    if(!input||typeof input!=="object"||Array.isArray(input)||Object.keys(input).sort().join(",")!=="baseVersion,entityId,payload"||!validId(input.entityId)||!validVersion(input.baseVersion))throw Error("Invalid horse update request");
    const payload=input.payload;
    const normalized=normalizeHorse(payload);
    ensureUniqueCode(normalized.code,input.entityId);
    return {changeId:store.addLocalChange({entityId:input.entityId,action:"update",payload:normalized,baseVersion:input.baseVersion})};
   });
   ipcMain.handle(CHANNELS.deleteHorse,async(event,input)=>{
    check(event);
    if(!input||typeof input!=="object"||Array.isArray(input)||Object.keys(input).sort().join(",")!=="baseVersion,entityId"||!validId(input.entityId)||!validVersion(input.baseVersion))throw Error("Invalid horse delete request");
    return {changeId:store.addLocalChange({entityId:input.entityId,action:"delete",payload:null,baseVersion:input.baseVersion})};
   });
  }
  } catch(error) { cleanup(); throw error; }
  return cleanup;
}
module.exports = { CHANNELS, trustedSender, registerOfflineReadIpc };
