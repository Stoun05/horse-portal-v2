import test from "node:test";
import assert from "node:assert/strict";
import { bearerToken, digestToken } from "../src/sessions.mjs";
test("session bearer parsing is strict", () => {
  const token = "a".repeat(64);
  assert.equal(bearerToken({ headers: { authorization: "Bearer " + token } }), token);
  assert.equal(bearerToken({ headers: { authorization: "Bearer wrong" } }), null);
  assert.equal(bearerToken({ headers: {} }), null);
  assert.equal(digestToken(token).length, 64);
  assert.notEqual(digestToken(token), token);
});
