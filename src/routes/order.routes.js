import express from "express";

import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

const router = express.Router();

// ===============================
// Customer Routes
// ===============================

// Create new order
router.post("/", protect, createOrder);

// Get logged-in customer orders
router.get("/my-orders", protect, getMyOrders);

// ===============================
// Admin Routes
// ===============================

// Get all orders
router.get("/", protect, adminMiddleware, getAllOrders);

// Get single order
router.get("/:id", protect, adminMiddleware, getOrderById);

// Update order status
router.patch("/:id/status", protect, adminMiddleware, updateOrderStatus);

// Delete order
router.delete("/:id", protect, adminMiddleware, deleteOrder);

export default router;
