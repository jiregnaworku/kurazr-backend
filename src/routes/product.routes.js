import express from "express";

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
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
    console.log("✅ Route reached");
    next();
  },
  protect,
  (req, res, next) => {
    console.log("✅ Auth passed");
    next();
  },
  adminMiddleware,
  (req, res, next) => {
    console.log("✅ Admin passed");
    next();
  },
  upload.array("images", 10),
  (req, res, next) => {
    console.log("✅ Multer passed");
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

export default router;
