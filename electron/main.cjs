/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, ipcMain, safeStorage } = require("electron");
const { attachAuthorizedWindow } = require("./authorized-window.cjs");
const { createOfflineSessionController } = require("./offline-session-controller.cjs");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

let server;

function resolveStaticFile(webRoot, requestPath) {
  const decoded = decodeURIComponent(requestPath);
  const relative = decoded.replace(/^\/+/, "");
  const resolved = path.resolve(webRoot, relative);
  const rootPrefix = `${path.resolve(webRoot)}${path.sep}`;

  if (resolved !== path.resolve(webRoot) && !resolved.startsWith(rootPrefix)) {
    return null;
  }

  const candidates = decoded.endsWith("/")
    ? [path.join(resolved, "index.html")]
    : [resolved, path.join(resolved, "index.html"), `${resolved}.html`];

  return candidates.find((candidate) => {
    try {
      return fs.statSync(candidate).isFile();
    } catch {
      return false;
    }
  }) ?? null;
}

function startStaticServer() {
  const webRoot = path.join(__dirname, "..", "out");

  return new Promise((resolve, reject) => {
    server = http.createServer((request, response) => {
      try {
        const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
        const filePath = resolveStaticFile(webRoot, requestUrl.pathname);

        if (!filePath) {
          response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          response.end("Sahypa tapylmady");
          return;
        }

        response.writeHead(200, {
          "Cache-Control": "no-cache",
          "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream",
        });

        if (request.method === "HEAD") {
          response.end();
          return;
        }

        fs.createReadStream(filePath).pipe(response);
      } catch {
        response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Programmany açmak başartmady");
      }
    });

    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Local server portuny alyp bolmady"));
        return;
      }
      resolve(address.port);
    });
  });
}

async function createWindow() {
  const port = await startStaticServer();
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#f4f7f5",
    icon: path.join(__dirname, "..", "build", "icon.ico"),
    webPreferences: {
      // Read-only bridge only; IPC handlers require a separately authorized account session.
      preload: path.join(__dirname, "offline-preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // No access on launch: a verified main-process login must eventually supply
  // a server-signed grant. Never accept a renderer-provided grant or user ID.
  const offlineSessions=createOfflineSessionController({
    attach:attachAuthorizedWindow,ipcMain,webContents:window.webContents,
    expectedOrigin:`http://127.0.0.1:${port}`,safeStorage,
    root:app.getPath("userData")
  });
  window.on("closed",()=>offlineSessions.dispose());
  // Login integration is still pending. No session is authorized here.
  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  window.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(`http://127.0.0.1:${port}/`)) event.preventDefault();
  });
  window.once("ready-to-show", () => window.show());
  await window.loadURL(`http://127.0.0.1:${port}/`);
}

app.whenReady().then(createWindow).catch((error) => {
  console.error(error);
  app.quit();
});

app.on("window-all-closed", () => {
  if (server) server.close();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
