const AppError = require("../errors/AppError");
const getRecords = require("../services/getRecords.service");
const asyncErrorHandler = require("../utils/asyncErrorHandler");

const getOrders = asyncErrorHandler(async (req, res, next) => {
  const { role, uid } = req["user"];

  const isAdmin = role === "admin" ? true : false;

  try {
    const orders = await getRecords(isAdmin, uid);

    res.status(200).json({
      success: true,
      orders,
      size: orders.length,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError(error, 500));
  }
});

module.exports = getOrders;
