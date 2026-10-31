const { app, BrowserWindow, protocol, net, shell } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const { pathToFileURL } = require("node:url");

protocol.registerSchemesAsPrivileged([
  { scheme: "atcylyk", privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }
]);

const ROOT = path.resolve(__dirname, "..", "out");
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif",
  ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2",
  ".mp4": "video/mp4", ".webm": "video/webm", ".txt": "text/plain; charset=utf-8"
};

app.whenReady().then(() => {
  protocol.handle("atcylyk", (request) => {
    const u = new URL(request.url);
    let pathname;
    try { pathname = decodeURIComponent(u.pathname); }
    catch { return new Response("Bad URL", { status: 400 }); }
    const candidate = path.resolve(ROOT, "." + pathname);
    if (candidate !== ROOT && !candidate.startsWith(ROOT + path.sep)) {
      return new Response("Forbidden", { status: 403 });
    }
    let target = candidate;
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
    if (!fs.existsSync(target) && !path.extname(target)) target = path.join(target, "index.html");
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
      return new Response("Not Found", { status: 404 });
    }
    return net.fetch(pathToFileURL(target).toString()).then(async (response) =>
      new Response(response.body, {
        status: response.status,
        headers: { "Content-Type": MIME[path.extname(target).toLowerCase()] || "application/octet-stream" }
      })
    );
  });

  const win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 900, minHeight: 600,
    title: "Atçylyk portaly",
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true }
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//i.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.loadURL("atcylyk://portal/");
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
