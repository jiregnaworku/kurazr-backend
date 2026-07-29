import express from "express";

import {
  sendMessage,
  getConversation,
  getMyMessages,
  markAsRead,
  deleteMessage,
} from "../controllers/message.Controller.js";

import { protect } from "../middleware/auth.Middleware.js";

const router = express.Router();

// =======================================
// Send Message
// =======================================

router.post("/send", protect, sendMessage);

// =======================================
// Get My Messages
// =======================================

router.get("/my", protect, getMyMessages);

// =======================================
// Get Conversation With Specific User
// =======================================

router.get("/conversation/:userId", protect, getConversation);

// =======================================
// Mark Message As Read
// =======================================

router.patch("/read/:id", protect, markAsRead);

// =======================================
// Delete Message
// =======================================

router.delete("/:id", protect, deleteMessage);

export default router;
