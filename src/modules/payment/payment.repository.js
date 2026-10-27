import mongoose from "mongoose";
import { ERROR_CODES, ORDER } from "#constants/index.js";
import { AppError } from "#errors/AppError.js";
import OrderModel from "#db/models/order.model.js";
import ProductModel from "#db/models/product.model.js";

export class PaymentRepository {
  /**
   * @param {string} orderId
   * @param {string|null} [userId=null]
   * @returns {Promise<object|null>}
   */
  static async findOrderById(orderId, userId = null) {
    const query = { _id: orderId };
    if (userId) query.userId = userId;
    return await OrderModel.findOne(query).lean();
  }

  /**
   * @param {string} orderId
   * @param {{
   *   paymentId: string,
   *   gateway: string,
   *   method?: string,
   *   userId: string,
   *   pushHistory?: boolean
   * }} params
   * @returns {Promise<object|null>}
   */
  static async updatePaymentInitiation(
    orderId,
    { paymentId, gateway, method, userId, pushHistory = true },
  ) {
    const updateOps = {
      $set: {
        "paymentDetails.poePaymentId": paymentId,
        "paymentDetails.gateway": gateway,
        "paymentDetails.paymentMethod": method,
      },
    };

    if (pushHistory) {
      updateOps.$push = {
        paymentStatusHistory: {
          status: ORDER.PAYMENT_STATUS.PENDING,
          at: new Date(),
          by: userId,
        },
      };
    }

    return await OrderModel.findByIdAndUpdate(orderId, updateOps, {
      returnDocument: "after",
    }).lean();
  }

  /**
   * @param {string} orderId
   * @param {{
   *   paymentStatus: string,
   *   paymentId: string,
   *   gateway: string,
   *   method?: string,
   *   userId: string
   * }} params
   * @returns {Promise<object|null>}
   */
  static async updatePaymentStatus(
    orderId,
    { paymentStatus, paymentId, gateway, method, userId },
  ) {
    return await OrderModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          paymentStatus,
          "paymentDetails.poePaymentId": paymentId,
          "paymentDetails.gateway": gateway,
          "paymentDetails.paymentMethod": method,
        },
        $push: {
          paymentStatusHistory: {
            status: paymentStatus,
            at: new Date(),
            by: userId,
          },
        },
      },
      { returnDocument: "after" },
    ).lean();
  }

  /**
   * Deducts inventory and confirms order in a MongoDB transaction
   * @param {object} order
   * @param {{
   *   paymentStatus: string,
   *   paymentId: string,
   *   gateway: string,
   *   method?: string,
   *   userId: string
   * }} params
   * @returns {Promise<{updatedProductIds: string[]}>}
   */
  static async deductStockAndConfirmOrder(
    order,
    { paymentStatus, paymentId, gateway, method, userId },
  ) {
    const session = await mongoose.startSession();
    const updatedProductIds = [];

    await session.withTransaction(async () => {
      for (const item of order.orderSnapshot) {
        const targetProduct = await ProductModel.findById(
          item.productId,
        ).session(session);

        if (!targetProduct || !targetProduct.isActive) {
          throw new AppError(
            `${item.name ? item.name + " " : ""}Product not found`,
            404,
            ERROR_CODES.NOT_FOUND_ERROR,
          );
        }

        if (targetProduct.stock < item.quantity) {
          throw new AppError(
            `Product (${targetProduct.name}) out of stock`,
            400,
            ERROR_CODES.OUT_OF_STOCK,
          );
        }

        targetProduct.stock -= item.quantity;
        await targetProduct.save({ session });
        updatedProductIds.push(item.productId.toString());
      }

      await OrderModel.findByIdAndUpdate(
        order._id,
        {
          $set: {
            paymentStatus,
            orderStatus: ORDER.ORDER_STATUS.CONFIRMED,
            "paymentDetails.poePaymentId": paymentId,
            "paymentDetails.gateway": gateway,
            "paymentDetails.paymentMethod": method,
            shippingStatusHistory: [
              {
                status: ORDER.SHIPPING_STATUS.PENDING,
                at: new Date(),
                by: userId,
              },
            ],
          },
          $push: {
            paymentStatusHistory: {
              status: paymentStatus,
              at: new Date(),
              by: userId,
            },
            orderStatusHistory: {
              status: ORDER.ORDER_STATUS.CONFIRMED,
              at: new Date(),
              by: userId,
            },
          },
        },
        { session },
      );
    });

    await session.endSession();
    return { updatedProductIds };
  }
}
