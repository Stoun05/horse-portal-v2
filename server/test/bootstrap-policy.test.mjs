import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const source = readFileSync(fileURLToPath(new URL("../src/bootstrap-admin.mjs", import.meta.url)), "utf8");
test("bootstrap requires local interactive terminal and does not print passwords", () => {
  assert.match(source, /input\.isTTY/);
  assert.match(source, /hashPassword\(password\)/);
  assert.doesNotMatch(source, /console\.log\(password\)/);
  assert.match(source, /role='Admin'/);
});
