import express from "express";

import {
  sendMessage,
  getConversation,
  getMyMessages,
  getAdminConversations,
  markAsRead,
  deleteMessage,
} from "../controllers/message.Controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// =======================================
// Get My Messages
// GET /api/messages
// =======================================

router.get("/", protect, getMyMessages);

// =======================================
// Send Message
// POST /api/messages
// =======================================

router.post("/", protect, sendMessage);

// =======================================
// Get Conversation With Specific User
// GET /api/messages/conversation/:userId
// =======================================

router.get("/conversation/:userId", protect, getConversation);

// =======================================
// Mark Message As Read
// PATCH /api/messages/:id/read
// =======================================

router.patch("/:id/read", protect, markAsRead);

// =======================================
// Delete Message
// DELETE /api/messages/:id
// =======================================

router.delete("/:id", protect, deleteMessage);
// =======================================
// Admin Conversation List
// =======================================

router.get("/admin/conversations", protect, getAdminConversations);

export default router;
