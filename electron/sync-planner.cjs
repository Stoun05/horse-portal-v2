/* Pure decision logic for offline synchronization; no network side effects. */
const ALLOWED_ACTIONS = new Set(["create", "update", "delete"]);
function validateQueuedChange(change) {
  if (!change || typeof change !== "object") return false;
  if (typeof change.id !== "string" || !change.id ||
      typeof change.entity_id !== "string" || !change.entity_id ||
      !ALLOWED_ACTIONS.has(change.action)) return false;
  if (change.action === "create" ? change.base_version !== null :
      (!Number.isInteger(change.base_version) || change.base_version < 1)) return false;
  if (change.action !== "delete" &&
      (!change.payload || typeof change.payload !== "object" || Array.isArray(change.payload))) return false;
  return true;
}
// The server is authoritative: never mark a queued change as synced on a network timeout.
function classifyServerResponse(change, response) {
  if (!validateQueuedChange(change)) return "invalid";
  if (!response || typeof response !== "object") return "retry";
  if (response.changeId !== change.id) return "retry";
  if (response.status === "accepted" && Number.isInteger(response.serverVersion) && response.serverVersion >= 1) return "ack";
  if (response.status === "conflict") return "conflict";
  if (response.status === "forbidden") return "blocked";
  return "retry";
}
function planSync(changes) {
  if (!Array.isArray(changes)) throw new Error("Invalid queue");
  // Preserve order, including several edits to the same horse.
  return changes.map(change => {
    if (!validateQueuedChange(change)) throw new Error("Invalid change in queue");
    return {
      changeId: change.id,
      entityId: change.entity_id,
      action: change.action,
      baseVersion: change.base_version,
      payload: change.payload
    };
  });
}
module.exports = { validateQueuedChange, classifyServerResponse, planSync };
