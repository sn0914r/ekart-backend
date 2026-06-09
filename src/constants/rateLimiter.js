export const RATE_LIMIT = {
  CREATE_PAYMENT: {
    WINDOW_MS: 10 * 60 * 1000,
    MAX: 10,
  },
  VERIFY_PAYMENT: {
    WINDOW_MS: 10 * 60 * 1000,
    MAX: 30,
  },
};
