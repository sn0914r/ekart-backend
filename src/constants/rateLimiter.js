export const RATE_LIMIT = {
  CREATE_PAYMENT: {
    WINDOW_MS: 600,
    MAX: 10,
    ROUTE: "/payments/create",
  },
  VERIFY_PAYMENT: {
    WINDOW_MS: 600,
    MAX: 30,
    ROUTE: "/payments/verify",
  },
  LOGIN: {
    WINDOW_MS: 300,
    MAX: 10,
    ROUTE: "/auth/register",
  },
  REGISTER: {
    WINDOW_MS: 300,
    MAX: 10,
    ROUTE: "/auth/login",
  },
};
