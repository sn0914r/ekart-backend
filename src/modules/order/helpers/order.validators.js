import { ORDER, ERROR_CODES } from "#constants/index.js";
import { AppError } from "#errors/AppError.js";

const {
  ORDER_STATUS,
  SHIPPING_STATUS,
  TRANSITIONS_ORDER: { SHIPPING_TRANSITIONS },
} = ORDER;

/**
 * Validates that all requested product IDs exist in the DB
 *
 * @param {{_id: object}[]} products - products fetched from DB
 * @param {string[]} productIds - product IDs from the cart
 * @returns {void}
 */
export const validateCartItems = (products, productIds) => {
  const foundIds = new Set(products.map((p) => p._id.toString()));

  const missing = productIds.filter((pId) => !foundIds.has(pId.toString()));

  if (missing.length > 0) {
    throw new AppError(
      `Products not available: ${missing.join(", ")}`,
      404,
      ERROR_CODES.NOT_FOUND_ERROR,
    );
  }
};

/**
 * Validates that all cart items have sufficient stock
 *
 * @param {{_id: object, name: string, stock: number}[]} products
 * @param {Map<string, number>} productQtyMap - productId → requested quantity
 * @returns {void}
 */
export const validateProductsStock = (products, productQtyMap) => {
  products.forEach((item) => {
    if (item.stock < productQtyMap.get(item._id.toString())) {
      throw new AppError(
        `Item (${item.name}) out of stock, available: ${item.stock}`,
        409,
        ERROR_CODES.BAD_REQUEST_ERROR,
      );
    }
  });
};

/**
 * Validates the transition between two states
 *
 * @param {Object} transitions - The transition matrix
 * @param {string} from - The current state
 * @param {string} to - The target state
 * @param {string} type - The type of state (default: "Status")
 */
const validateTransition = (transitions, from, to, type = "Status") => {
  if (from === to) return;

  const allowed = transitions[from];

  if (!allowed || !allowed.includes(to)) {
    throw new AppError(
      `${type} cannot be changed from ${from} to ${to}`,
      ERROR_CODES.BAD_REQUEST_ERROR,
      409,
    );
  }
};

/**
 * Validates that the shipping status transition is allowed
 *
 * @param {string} from - current shipping status
 * @param {string} to - target shipping status
 * @returns {void}
 */
export const validateShippingStatusTransition = (from, to) => {
  validateTransition(SHIPPING_TRANSITIONS, from, to);
};

/**
 * Asserts that the order is in a cancellable state
 *
 * @param {string} orderStatus
 * @param {string} shippingStatus
 * @returns {void}
 */
export const assertOrderStatus = (orderStatus, shippingStatus) => {
  const isAllowed =
    orderStatus === ORDER_STATUS.CREATED ||
    (orderStatus === ORDER_STATUS.CONFIRMED &&
      shippingStatus === SHIPPING_STATUS.PENDING);

  if (!isAllowed) {
    throw new AppError("Invalid order status transition");
  }
};
