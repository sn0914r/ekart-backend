import { ROLES, USER } from "#constants/index.js";

const { VALID_SORT_FIELDS } = USER;

/**
 * Parses and normalizes pagination query params for users
 *
 * @param {{ page?: string | number, limit?: string | number }} query
 * @returns {{ page: number, limit: number, skip: number }}
 */
export const buildUserPagination = (query) => {
  let { page = 1, limit = 10 } = query;

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;

  limit = Math.min(limit, 50);
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

/**
 * Builds a MongoDB filter object from user query params
 *
 * @param {{ search?: string, role?: string, isActive?: string | boolean }} query
 * @returns {Record<string, unknown>} MongoDB filter object
 */
export const buildUserFilter = (query) => {
  const { search = null, role = null, isActive = null } = query;

  const filters = {
    isDeleted: { $ne: true },
  };

  if (search && search.trim()) {
    const trimmed = search.trim();
    filters.$or = [
      { name: { $regex: trimmed, $options: "i" } },
      { email: { $regex: trimmed, $options: "i" } },
      { phone: { $regex: trimmed, $options: "i" } },
    ];
  }

  if (role && Object.values(ROLES).includes(role)) {
    filters.role = role;
  }

  if (isActive !== null && isActive !== undefined) {
    if (isActive === "true" || isActive === true) {
      filters.isActive = true;
    } else if (isActive === "false" || isActive === false) {
      filters.isActive = false;
    }
  }

  return filters;
};

/**
 * Builds a MongoDB sort object from query params
 *
 * @param {{ sort?: string }} query
 * @returns {Record<string, 1 | -1>} MongoDB sort object
 */
export const buildUserSort = (query) => {
  const { sort = null } = query;
  const sortOptions = {};

  if (!sort) {
    sortOptions.createdAt = -1;
    return sortOptions;
  }

  const sortedFields = sort.split(",");
  const filteredSortFields = sortedFields.filter((field) =>
    VALID_SORT_FIELDS.includes(field.trim()),
  );

  filteredSortFields.forEach((field) => {
    const cleanField = field.trim();
    const isDesc = cleanField.startsWith("-") ? -1 : 1;
    const propName = isDesc === -1 ? cleanField.slice(1) : cleanField;

    sortOptions[propName] = isDesc;
  });

  if (!sortOptions.createdAt) {
    sortOptions.createdAt = -1;
  }

  return sortOptions;
};
