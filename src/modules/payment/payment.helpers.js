import { ORDER } from "#constants/index.js";

/**
 * Maps a POE payment status to an ekart specific PAYMENT_STATUS
 *
 * @param {string} poeStatus - status string from POE
 * @returns {string} - ekart ORDER.PAYMENT_STATUS
 */
export const mapPoeStatusToEkartStatus = (poeStatus) => {
  const { PAYMENT_STATUS } = ORDER;

  switch (poeStatus) {
    case "initiated":
    case "processing":
      return PAYMENT_STATUS.PENDING;
    case "success":
      return PAYMENT_STATUS.PAID;
    case "failed":
      return PAYMENT_STATUS.FAILED;
    default:
      // INFO: Fallback to PENDING if we receive an unknown status
      return PAYMENT_STATUS.PENDING;
  }
};
