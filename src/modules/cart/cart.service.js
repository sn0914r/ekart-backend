const Cart = require("./cart.model");

const updateCart = ({ uid, items }) => {
  return Cart.findOneAndUpdate({ uid }, { items }, { upsert: true, new: true });
};

const getCart = ({ uid }) => {
  return Cart.findOne({ uid });
};

module.exports = {
  updateCart,
  getCart,
};
