import test from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL ||= "postgresql://unused:unused@127.0.0.1:5432/unused";
const { validSetupToken, validNewPassword, tokenDigest } = await import("../src/password-setup.mjs");
test("setup tokens must be cryptographically shaped", () => {
  assert.equal(validSetupToken("a".repeat(64)), true);
  assert.equal(validSetupToken("secret"), false);
  assert.equal(validSetupToken("A".repeat(64)), false);
  assert.equal(tokenDigest("a".repeat(64)).length, 64);
});
test("employees must select a sufficiently long password", () => {
  assert.equal(validNewPassword("long-secure-password"), true);
  assert.equal(validNewPassword("short"), false);
  assert.equal(validNewPassword(null), false);
});
