import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { configs } from "./configs/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import morgan from "morgan";

import { authRouter } from "./modules/auth/auth.routes.js";
import { orderRouter } from "./modules/order/order.routes.js";
import { paymentRouter } from "./modules/payment/payment.routes.js";
import { productsRouter } from "./modules/product/product.routes.js";
import { cartRouter } from "./modules/cart/cart.routes.js";
import { wishlistRouter } from "./modules/wishlist/wishlist.routes.js";
import { insightsRouter } from "./modules/insights/insights.routes.js";

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: configs.clientOrigins,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PATCH"],
  }),
);
app.use(helmet());

app.use(morgan("dev"));
app.use(authRouter);
app.use(orderRouter);
app.use(paymentRouter);
app.use(productsRouter);
app.use(cartRouter);
app.use(wishlistRouter);
app.use(insightsRouter);

app.use("/health", (req, res) => {
  res.status(200).json({ success: true });
});

app.use(errorHandler);
