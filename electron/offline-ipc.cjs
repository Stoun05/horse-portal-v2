/* Registration is opt-in until authenticated renderer and encrypted per-user storage exist. */
const CHANNELS = Object.freeze({
  status: "offline:status",
  horses: "offline:horses",
  pendingCount: "offline:pending-count",
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
  expectedSender?.once?.("destroyed",closeOnDestroyed);
  const check = (event) => {
    if(!active) throw new Error("Offline IPC session closed");
    if (expectedSender && event?.sender !== expectedSender) throw new Error("Forbidden IPC window");
    if (!trustedSender(event, expectedOrigin)) throw new Error("Forbidden IPC sender");
  };
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
  return cleanup;
}
module.exports = { CHANNELS, trustedSender, registerOfflineReadIpc };
