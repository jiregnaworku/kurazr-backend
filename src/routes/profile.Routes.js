import express from "express";

import {
  getProfile,
  updateProfile,
  changePassword,
  deleteProfile,
} from "../controllers/profile.Controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get logged in user's profile
router.get("/", protect, getProfile);

// Update profile
router.put("/", protect, updateProfile);

// Change password
router.put("/password", protect, changePassword);

// Delete account
router.delete("/", protect, deleteProfile);

export default router;
