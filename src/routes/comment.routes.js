import express from "express";

import {
  getComments,
  addComment,
  deleteComment,
  toggleCommentVisibility,
} from "../controllers/comment.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// =======================================
// Get Product Comments
// GET /api/comments/:productId
// =======================================

router.get("/:productId", getComments);

// =======================================
// Add Comment
// POST /api/comments/:productId
// =======================================

router.post("/:productId", protect, addComment);

// =======================================
// Delete Comment
// DELETE /api/comments/:commentId
// =======================================

router.delete("/:commentId", protect, deleteComment);

// =======================================
// Hide / Unhide Comment (Admin)
// PATCH /api/comments/:commentId/hide
// =======================================

router.patch("/:commentId/hide", protect, toggleCommentVisibility);

export default router;
