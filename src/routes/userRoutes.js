import express from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  blockUser,
  deleteUser,
} from "../controllers/userController.js";

import { protect } from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

const router = express.Router();

// Get all users (Admin only)
router.get("/", protect, adminMiddleware, getUsers);

// Get single user (Admin only)
router.get("/:id", protect, adminMiddleware, getUserById);

// Update user (Admin only)
router.put("/:id", protect, adminMiddleware, updateUser);

// Block / Unblock user (Admin only)
router.patch("/:id/block", protect, adminMiddleware, blockUser);

// Delete user (Admin only)
router.delete("/:id", protect, adminMiddleware, deleteUser);

export default router;
