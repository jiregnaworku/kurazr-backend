import express from "express";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
} from "../controllers/notification.Controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

const router = express.Router();

// Customer
router.get("/", protect, getNotifications);

router.put("/:id/read", protect, markAsRead);

router.put("/read-all", protect, markAllAsRead);

router.delete("/:id", protect, deleteNotification);

// Admin
router.post("/", protect, adminMiddleware, createNotification);
router.put("/mark-all-read", protect, adminMiddleware, markAllAsRead);

export default router;
