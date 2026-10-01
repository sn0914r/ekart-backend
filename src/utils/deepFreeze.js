/**
 * Recursively freezes an object and its nested properties to guarantee runtime immutability
 *
 * @template T
 * @param {T} obj
 * @returns {Readonly<T>}
 */
export const deepFreeze = (obj) => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  Object.values(obj).forEach((val) => {
    if (typeof val === "object" && val !== null && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  });

  return Object.freeze(obj);
};
