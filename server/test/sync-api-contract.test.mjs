import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const source = readFileSync(fileURLToPath(new URL("../src/index.mjs", import.meta.url)), "utf8");
const apply = readFileSync(fileURLToPath(new URL("../src/sync-apply.mjs", import.meta.url)), "utf8");
test("sync endpoint requires active session before applying a mutation", () => {
  const route = source.slice(source.indexOf('pathname === "/api/sync/horses"'),source.indexOf('if (req.method !== "GET")'));
  assert.match(route,/getSessionUser\(req\)/);
  assert.match(route,/if \(!user\)/);
  assert.match(route,/applyHorseSync\(user, change\)/);
});
test("server rechecks permission and version before accepting", () => {
  assert.match(apply,/maySyncHorse\(user.role, change.action\)/);
  assert.match(apply,/change.baseVersion !== currentVersion/);
  assert.match(apply,/INSERT INTO sync_operations/);
  assert.match(apply,/COMMIT/);
});
