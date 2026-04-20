const { Schema } = require("mongoose");

const StatusHistory = new Schema(
  {
    status: String,
    at: Date,
    by: String,
  },
  {
    _id: false,
  },
);

module.exports = StatusHistory;
