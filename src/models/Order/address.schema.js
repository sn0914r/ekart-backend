const { Schema } = require("mongoose");

const ShippingAddressSchema = new Schema(
  {
    name: String,
    address: String,
    phone: String,
    city: String,
    state: String,
    country: { type: String, default: "India" },
    pincode: String,
  },
  {
    _id: false,
  },
);

module.exports = ShippingAddressSchema;
