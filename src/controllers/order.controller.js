import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Notification from "../models/Notification.js";

// =======================================
// Generate Order Number
// =======================================

const generateOrderNumber = () => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  const random = Math.floor(1000 + Math.random() * 9000);

  return `KURAZ-${year}${month}${day}-${random}`;
};

// =======================================
// Create Order
// =======================================

export const createOrder = async (req, res) => {
  try {
    const {
      productId,
      quantity,
      size,
      color,
      phone,
      address,
      note,
      paymentMethod,
    } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock available",
      });
    }

    const totalPrice = product.price * quantity;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),

      customer: req.user._id,

      customerName: req.user.fullName || "Customer",

      product: product._id,

      productName: product.name,

      productImage: product.images?.[0] || "",

      quantity,

      size,

      color,

      phone,

      address,

      note,

      paymentMethod,

      totalPrice,
    });

    // Reduce stock
    product.stock -= quantity;
    await product.save();

    // =======================================
    // Create Notification
    // =======================================

    await Notification.create({
      user: req.user._id,
      title: "Order Placed Successfully",
      message: `Your order (${order.orderNumber}) has been placed successfully. We will process it shortly.`,
      type: "order",
      isRead: false,
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
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
// Customer Orders
// =======================================

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.user._id,
    })
      .populate("product", "name images price")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      orders,
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
// Admin - Get All Orders
// =======================================

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "fullName phone email")
      .populate("product", "name images price")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      orders,
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
// Admin - Get Single Order
// =======================================

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "fullName phone email")
      .populate("product", "name images price");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.json({
      success: true,
      order,
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
// Admin - Update Status
// =======================================

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const status = req.body.orderStatus || req.body.status;

    if (status) {
      order.orderStatus = status;
    }

    if (status === "Cancelled") {
      order.cancelReason = req.body.cancelReason || "";
    }

    if (req.body.paymentStatus) {
      order.paymentStatus = req.body.paymentStatus;
    }

    await order.save();

    // =======================================
    // Notify Customer
    // =======================================

    await Notification.create({
      user: order.customer,
      title: "Order Status Updated",
      message: `Your order (${order.orderNumber}) status is now "${order.orderStatus}".`,
      type: "order",
      isRead: false,
    });

    return res.json({
      success: true,
      message: "Order updated successfully",
      order,
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
// Admin - Delete Order
// =======================================

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Notify customer before deleting the order
    await Notification.create({
      user: order.customer,
      title: "Order Deleted",
      message: `Your order (${order.orderNumber}) has been removed by the administrator.`,
      type: "order",
      isRead: false,
    });

    await order.deleteOne();

    return res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
