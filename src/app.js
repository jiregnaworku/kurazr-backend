import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profile.Routes.js";
import notificationRoutes from "./routes/notification.Routes.js";
import messageRoutes from "./routes/message.Routes.js";
import commentRoutes from "./routes/comment.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["https://kuraz-website.vercel.app", "http://localhost:5173"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/comments", commentRoutes);

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:");
  console.error(err);

  res.status(500).json({
    success: false,
    message: err.message,
  });
});

export default app;
