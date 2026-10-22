const test = require("node:test");
const assert = require("node:assert/strict");
const { trustedSender, registerOfflineReadIpc } = require("../offline-ipc.cjs");
test("IPC rejects unrelated pages and subframes", () => {
  const mainFrame = { url: "http://127.0.0.1:4444/atlar" };
  const sender = { mainFrame };
  assert.equal(trustedSender({ sender, senderFrame: mainFrame }, "http://127.0.0.1:4444"), true);
  assert.equal(trustedSender({ sender, senderFrame: { url: "http://127.0.0.1:4444/" } }, "http://127.0.0.1:4444"), false);
  assert.equal(trustedSender({ sender, senderFrame: mainFrame }, "http://127.0.0.1:5555"), false);
  assert.equal(trustedSender({ sender, senderFrame: { url: "https://evil.invalid/" } }, "http://127.0.0.1:4444"), false);
});
test("only constrained read-only channels are registered", async () => {
  const handlers = new Map();
  const ipcMain = { handle(name, fn) { handlers.set(name, fn); }, removeHandler(name) { handlers.delete(name); } };
  const store = { listHorses: () => [{ id: "a" }], listPending: () => [{ id: "pending" }], lastSyncedAt: () => null };
  const cleanup = registerOfflineReadIpc({ ipcMain, store, expectedOrigin: "http://127.0.0.1:4444" });
  assert.equal(handlers.size, 3);
  const frame = { url: "http://127.0.0.1:4444/" };
  const event = { sender: { mainFrame: frame }, senderFrame: frame };
  assert.deepEqual(await handlers.get("offline:status")(event), { lastSyncedAt: null, pendingCount: 1 });
  assert.deepEqual(await handlers.get("offline:horses")(event), [{ id: "a" }]);
  await assert.rejects(() => handlers.get("offline:horses")({ senderFrame: { url: "https://other.invalid" }, sender: { mainFrame: frame } }), /Forbidden/);
  cleanup();
  assert.equal(handlers.size, 0);
});
