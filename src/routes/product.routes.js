import express from "express";

import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  toggleLike,
} from "../controllers/product.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

// =================================
// Public Routes
// =================================

// Get all products
router.get("/", getProducts);

// Get single product
router.get("/:id", getProduct);

// =================================
// Admin Routes
// =================================

// Create Product
router.post(
  "/",
  (req, res, next) => {
    next();
  },
  protect,
  (req, res, next) => {
    next();
  },
  adminMiddleware,
  (req, res, next) => {
    next();
  },
  upload.array("images", 10),
  (req, res, next) => {
    next();
  },
  createProduct,
);

// Update Product
router.put(
  "/:id",
  protect,
  adminMiddleware,
  upload.array("images", 10),
  updateProduct,
);

// Delete Product
router.delete("/:id", protect, adminMiddleware, deleteProduct);

router.patch("/:id/like", toggleLike);

export default router;
