/* Registration is opt-in until authenticated renderer and encrypted per-user storage exist. */
const CHANNELS = Object.freeze({
  status: "offline:status",
  horses: "offline:horses",
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
function registerOfflineReadIpc({ ipcMain, store, expectedOrigin, expectedSender }) {
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
  ipcMain.handle(CHANNELS.pendingCount, async (event) => {
    check(event);
    return store.listPending().length;
  });
  if(typeof store.addLocalChange==="function") ipcMain.handle(CHANNELS.createHorse,async(event,input)=>{
    check(event);
    if(!input||typeof input!=="object"||Array.isArray(input)||Object.keys(input).sort().join(",")!=="entityId,payload")throw Error("Invalid horse create request");
    const {entityId,payload}=input;
    if(typeof entityId!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(entityId))throw Error("Invalid horse ID");
    if(!payload||typeof payload!=="object"||Array.isArray(payload)||Object.keys(payload).sort().join(",")!=="code,name"||typeof payload.name!=="string"||!payload.name.trim()||payload.name.length>160||typeof payload.code!=="string"||payload.code.length>80)throw Error("Invalid horse data");
    return {changeId:store.addLocalChange({entityId,action:"create",payload,baseVersion:null})};
  });
  if(typeof store.addLocalChange==="function"){
   const validId=id=>typeof id==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
   const validVersion=v=>Number.isSafeInteger(v)&&v>=1;
   ipcMain.handle(CHANNELS.updateHorse,async(event,input)=>{
    check(event);
    if(!input||typeof input!=="object"||Array.isArray(input)||Object.keys(input).sort().join(",")!=="baseVersion,entityId,payload"||!validId(input.entityId)||!validVersion(input.baseVersion))throw Error("Invalid horse update request");
    const payload=input.payload;
    if(!payload||typeof payload!=="object"||Array.isArray(payload)||Object.keys(payload).sort().join(",")!=="code,name"||typeof payload.name!=="string"||!payload.name.trim()||payload.name.length>160||typeof payload.code!=="string"||payload.code.length>80)throw Error("Invalid horse data");
    return {changeId:store.addLocalChange({entityId:input.entityId,action:"update",payload,baseVersion:input.baseVersion})};
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
