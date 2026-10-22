import test from "node:test";
import assert from "node:assert/strict";
import { isAuthorized } from "../src/auth.mjs";
const validToken = "local-development-token-example-123456789";
test("token is required and must match", () => {
  const old = process.env.API_TOKEN;
  try {
    process.env.API_TOKEN = validToken;
    assert.equal(isAuthorized({ headers: {} }), false);
    assert.equal(isAuthorized({ headers: { authorization: "Bearer wrong" } }), false);
    assert.equal(isAuthorized({ headers: { authorization: "Bearer " + validToken } }), true);
    process.env.API_TOKEN = "short";
    assert.equal(isAuthorized({ headers: { authorization: "Bearer short" } }), false);
  } finally {
    if (old === undefined) delete process.env.API_TOKEN;
    else process.env.API_TOKEN = old;
  }
});
