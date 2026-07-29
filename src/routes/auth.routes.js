import express from "express";

import {
  signup,
  login,
  profile,
  updateProfile,
  deleteProfile,
} from "../controllers/auth.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.get("/profile", protect, profile);

router.put("/profile", protect, updateProfile);

router.delete("/profile", protect, deleteProfile);

export default router;
