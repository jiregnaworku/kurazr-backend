import Comment from "../models/Comment.js";
import Product from "../models/Product.js";

// =======================================
// Get Product Comments
// =======================================

export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      product: req.params.productId,
      hidden: false,
    })
      .populate("user", "fullName profileImage role")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================================
// Add Comment
// =======================================

export const addComment = async (req, res) => {
  try {
    // 1. Extract 'message' instead of 'comment'
    const { message } = req.body;

    // 2. Validate 'message'
    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty.",
      });
    }

    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // 3. Save using 'message' to satisfy the Mongoose schema requirement
    const newComment = await Comment.create({
      product: product._id,
      user: req.user._id,
      message: message.trim(),
    });

    const populatedComment = await Comment.findById(newComment._id).populate(
      "user",
      "fullName profileImage role",
    );

    return res.status(201).json({
      success: true,
      comment: populatedComment, // Frontend expects 'data.comment'
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================================
// Delete Comment
// =======================================

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    const isOwner = comment.user.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized.",
      });
    }

    await comment.deleteOne();

    return res.json({
      success: true,
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================================
// Hide / Unhide Comment (Admin)
// =======================================

export const toggleCommentVisibility = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can perform this action.",
      });
    }

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    comment.isHidden = !comment.isHidden;

    await comment.save();

    return res.json({
      success: true,
      hidden: comment.isHidden,
      message: comment.isHidden
        ? "Comment hidden successfully."
        : "Comment is now visible.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
