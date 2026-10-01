import { deepFreeze } from "#utils/deepFreeze.js";

export const ROLES = deepFreeze({
  USER: "user",
  ADMIN: "admin",
  DEMO_ADMIN: "demo-admin",
});
