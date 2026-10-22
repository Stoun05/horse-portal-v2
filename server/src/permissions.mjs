export const ROLES = Object.freeze(["Admin", "Operator", "Weterinar", "Gözegçi"]);
const PERMISSIONS = Object.freeze({
  Admin: ["horses:read", "horses:create", "horses:update", "horses:delete", "health:read", "health:write", "users:manage", "reports:read"],
  Operator: ["horses:read", "horses:create", "horses:update", "health:read", "reports:read"],
  Weterinar: ["horses:read", "health:read", "health:write", "reports:read"],
  "Gözegçi": ["horses:read"],
});
export function can(role, action) {
  return typeof role === "string" && typeof action === "string"
    && Object.hasOwn(PERMISSIONS, role) && PERMISSIONS[role].includes(action);
}
