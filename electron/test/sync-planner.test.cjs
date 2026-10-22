const test = require("node:test");
const assert = require("node:assert/strict");
const { validateQueuedChange, classifyServerResponse, planSync } = require("../sync-planner.cjs");
const change = { id: "op-1", entity_id: "horse-01", action: "update", base_version: 3, payload: { name: "Akýol" } };
test("queue preserves change order", () => {
  const second = { ...change, id: "op-2", base_version: 4 };
  assert.deepEqual(planSync([change, second]).map(x => x.changeId), ["op-1", "op-2"]);
});
test("only explicitly acknowledged updates can leave the queue", () => {
  assert.equal(classifyServerResponse(change, { changeId: "op-1", status: "accepted", serverVersion: 4 }), "ack");
  assert.equal(classifyServerResponse(change, { changeId: "another", status: "accepted", serverVersion: 4 }), "retry");
  assert.equal(classifyServerResponse(change, null), "retry");
  assert.equal(classifyServerResponse(change, { changeId: "op-1", status: "accepted" }), "retry");
});
test("conflicts and forbidden requests are never silently overwritten", () => {
  assert.equal(classifyServerResponse(change, {changeId: "op-1", status: "conflict"}), "conflict");
  assert.equal(classifyServerResponse(change, {changeId: "op-1", status: "forbidden"}), "blocked");
});
test("invalid queued operations are rejected", () => {
  assert.equal(validateQueuedChange({ ...change, action: "execute" }), false);
  assert.throws(() => planSync([{ ...change, base_version: -1 }]));
});

test("client queue version rules match server validation", () => {
 assert.equal(validateQueuedChange({ ...change, action: "create", base_version: null }), true);
 assert.equal(validateQueuedChange({ ...change, action: "create", base_version: 1 }), false);
 assert.equal(validateQueuedChange({ ...change, action: "update", base_version: null }), false);
 assert.equal(validateQueuedChange({ ...change, action: "update", base_version: 0 }), false);
 assert.equal(classifyServerResponse(change, { changeId: change.id, status: "forbidden" }), "blocked");
});
