import { Schema } from "mongoose";

export const StatusHistory = new Schema(
  {
    status: String,
    at: Date,
    by: String,
  },
  {
    _id: false,
  },
);
