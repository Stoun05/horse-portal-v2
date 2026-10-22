const { contextBridge, ipcRenderer } = require("electron");
const CHANNELS = Object.freeze({
  status: "offline:status",
  horses: "offline:horses",
  pendingCount: "offline:pending-count",
});
// Narrow read-only API: no arbitrary SQL, IPC channels, filesystem or writable access.
contextBridge.exposeInMainWorld("atcylykOffline", Object.freeze({
  getStatus: () => ipcRenderer.invoke(CHANNELS.status),
  listHorses: () => ipcRenderer.invoke(CHANNELS.horses),
  getPendingCount: () => ipcRenderer.invoke(CHANNELS.pendingCount),
}));
