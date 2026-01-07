const asyncErrorHandler = require("../utils/asyncErrorHandler");

const postOrder = asyncErrorHandler(async (req, res, next) => {
    // TODO: implement
    res.status(200).json({ success: true, message: "POST /user/orders" });
});

module.exports = postOrder;