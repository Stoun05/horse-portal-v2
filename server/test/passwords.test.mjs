import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../src/passwords.mjs";

test("password hashes are salted and verifiable", async () => {
  const password = "Atcylyk-Strong-Password-2026";
  const a = await hashPassword(password);
  const b = await hashPassword(password);
  assert.notEqual(a, b);
  assert.equal(await verifyPassword(password, a), true);
  assert.equal(await verifyPassword("wrong password", a), false);
});
test("invalid hashes and weak passwords are rejected", async () => {
  await assert.rejects(() => hashPassword("short"));
  assert.equal(await verifyPassword("abc", "garbage"), false);
  assert.equal(await verifyPassword("abc", "scrypt-v1:00:00"), false);
});
