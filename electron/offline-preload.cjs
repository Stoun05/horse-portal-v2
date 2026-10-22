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

/* Fixed credential-only desktop authentication bridge. No token or grant access. */
contextBridge.exposeInMainWorld("atcylykDesktopAuth",Object.freeze({
 login:(username,password)=>ipcRenderer.invoke("desktop-auth:login",{username,password}),
 logout:()=>ipcRenderer.invoke("desktop-auth:logout"),
 getStatus:()=>ipcRenderer.invoke("desktop-auth:status"),
}));
