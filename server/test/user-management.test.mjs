import test from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL ||= "postgresql://unused:unused@127.0.0.1:5432/unused";
const { validateUsername, validateRole, mayManageUsers, hashSetupToken } = await import("../src/user-management.mjs");
test("only administrators can manage users", () => {
 assert.equal(mayManageUsers({ role: "Admin" }), true);
 assert.equal(mayManageUsers({ role: "Operator" }), false);
 assert.equal(mayManageUsers({ role: "Weterinar" }), false);
 assert.equal(mayManageUsers(null), false);
});
test("account inputs are validated", () => {
 assert.equal(validateUsername("staff_01"), true);
 assert.equal(validateUsername(""), false);
 assert.equal(validateUsername("../admin"), false);
 assert.equal(validateRole("Admin"), true);
 assert.equal(validateRole("invalid"), false);
 assert.equal(hashSetupToken("sample").length, 64);
});
