import { can } from "./permissions.mjs";
export function validateSyncChange(change) {
  if (!change || typeof change !== "object" || Array.isArray(change)) return false;
  if (typeof change.changeId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(change.changeId)) return false;
  if (typeof change.entityId !== "string" || change.entityId.length < 1 || change.entityId.length > 150) return false;
  if (!["create","update","delete"].includes(change.action)) return false;
  if (change.action === "create" && change.baseVersion !== null) return false;
  if (change.action !== "create" && (!Number.isInteger(change.baseVersion) || change.baseVersion < 1)) return false;
  if (change.action !== "delete" && (!change.payload || typeof change.payload !== "object" || Array.isArray(change.payload))) return false;
  return true;
}
export function maySyncHorse(role, action) {
  const actionPermission = { create: "horses:create", update: "horses:update", delete: "horses:delete" }[action];
  return Boolean(actionPermission && can(role, actionPermission));
}
