import test from "node:test";
import assert from "node:assert/strict";
import { ROLES, can } from "../src/permissions.mjs";

test("roles are known and unknown values fail closed", () => {
  assert.deepEqual(ROLES, ["Admin", "Operator", "Weterinar", "Gözegçi"]);
  assert.equal(can("unknown", "horses:read"), false);
  assert.equal(can("__proto__", "horses:read"), false);
  assert.equal(can("Admin", "unknown"), false);
});
test("horse write privileges require appropriate role", () => {
  assert.equal(can("Admin", "horses:delete"), true);
  assert.equal(can("Operator", "horses:create"), true);
  assert.equal(can("Operator", "horses:delete"), false);
  assert.equal(can("Weterinar", "horses:update"), false);
  assert.equal(can("Gözegçi", "horses:create"), false);
});
test("veterinarian may write health records but observer may not", () => {
  assert.equal(can("Weterinar", "health:write"), true);
  assert.equal(can("Gözegçi", "health:write"), false);
  assert.equal(can("Admin", "users:manage"), true);
  assert.equal(can("Operator", "users:manage"), false);
});
