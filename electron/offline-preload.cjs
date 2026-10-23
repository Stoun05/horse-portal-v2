const { contextBridge, ipcRenderer } = require("electron");
const CHANNELS = Object.freeze({
  status: "offline:status",
  horses: "offline:horses",
  pendingCount: "offline:pending-count",
});
// Narrow fixed-method API: no arbitrary SQL, generic IPC, or filesystem access.
contextBridge.exposeInMainWorld("atcylykOffline", Object.freeze({
  getStatus: () => ipcRenderer.invoke(CHANNELS.status),
  listHorses: () => ipcRenderer.invoke(CHANNELS.horses),
  getPendingCount: () => ipcRenderer.invoke(CHANNELS.pendingCount),
  createHorse: (entityId,payload) => ipcRenderer.invoke("offline:create-horse",{entityId,payload}),
  updateHorse: (entityId,baseVersion,payload) => ipcRenderer.invoke("offline:update-horse",{entityId,baseVersion,payload}),
  deleteHorse: (entityId,baseVersion) => ipcRenderer.invoke("offline:delete-horse",{entityId,baseVersion}),
}));

/* Fixed credential-only desktop authentication bridge. No token or grant access. */
contextBridge.exposeInMainWorld("atcylykDesktopAuth",Object.freeze({
 login:(username,password)=>ipcRenderer.invoke("desktop-auth:login",{username,password}),
 logout:()=>ipcRenderer.invoke("desktop-auth:logout"),
 getStatus:()=>ipcRenderer.invoke("desktop-auth:status"),
}));
