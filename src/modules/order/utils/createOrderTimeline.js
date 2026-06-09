import { ORDER_TIMELINE_LABELS } from "../../../constants/order.js";

/**
 * @typedef {Object} TimelineEntry
 * @property {'PAYMENT' | 'ORDER' | 'SHIPPING'} type
 * @property {string} status
 * @property {string} label
 * @property {Date} at
 */

/**
 * @param {{ status: string, at: Date }} paymentStatusHistory
 * @param {{ status: string, at: Date }[]} orderStatusHistory
 * @param {{ status: string, at: Date }[]} shippingStatusHistory
 * @returns {TimelineEntry[]}
 */

export const createTimeline = (
  paymentStatusHistory,
  orderStatusHistory,
  shippingStatusHistory,
) => {
  const PaymentTimeline = {
    type: "PAYMENT",
    status: paymentStatusHistory.status,
    label: ORDER_TIMELINE_LABELS.PAYMENT[paymentStatusHistory.status],
    at: paymentStatusHistory.at,
  };

  const OrderTimeline = orderStatusHistory.map((item) => {
    const type = "ORDER";
    const status = item.status;
    const label = ORDER_TIMELINE_LABELS.ORDER[item.status];
    const at = item.at;

    return { type, status, label, at };
  });

  const shippingStatus = shippingStatusHistory.map((item) => {
    const type = "SHIPPING";
    const status = item.status;
    const label = ORDER_TIMELINE_LABELS.SHIPPING[item.status];
    const at = item.at;

    return { type, status, label, at };
  });

  const timeline = [PaymentTimeline, ...OrderTimeline, ...shippingStatus].sort(
    (a, b) => new Date(a.at) - new Date(b.at),
  );

  return timeline;
};
