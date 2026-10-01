import { deepFreeze } from "#utils/deepFreeze.js";

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
