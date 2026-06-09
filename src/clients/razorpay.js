import Razorpay from "razorpay";
import { configs } from "../configs/index.js";

export const razorpay = new Razorpay({
  key_id: configs.razorpay.keyId,
  key_secret: configs.razorpay.keySecret,
});
