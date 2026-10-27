import { deepFreeze } from "#utils/deepFreeze.js";

export const ROLES = deepFreeze({
  USER: "user",
  ADMIN: "admin",
  DEMO_ADMIN: "demo-admin",
});

export const USER = deepFreeze({
  VALID_SORT_FIELDS: [
    "createdAt",
    "-createdAt",
    "name",
    "-name",
    "email",
    "-email",
    "role",
    "-role",
  ],
});
