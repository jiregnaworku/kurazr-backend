import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // keep product information even if product changes
    productName: {
      type: String,
      required: true,
    },

    productImage: {
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
    },

    size: {
      type: String,
      required: true,
    },

    color: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    note: {
      type: String,
      default: "",
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Telebirr", "CBE", "Bank"],
      default: "Cash",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Preparing",
        "Shipping",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    cancelReason: {
      type: String,
      default: "",
    },

    totalPrice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Order", orderSchema);
