const AppError = require("../errors/AppError");
const sendMailOnPatch = require("../services/sendMailOnPatch");
const updateRecord = require("../services/updateRecord.service");
const asyncErrorHandler = require("../utils/asyncErrorHandler");

const patchOrders = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;

  const updatedAt = new Date();
  try {
    if (!id) {
      throw new AppError("Invalid order id", 400);
    }
    const updates = {
      ...req.body,
      updatedAt,
    };
    const updatedRecord = await updateRecord(id, updates);

    sendMailOnPatch(updatedRecord);

    res.status(200).json({
      success: true,
      data: updatedRecord,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError(error, 500));
  }
});

module.exports = patchOrders;
