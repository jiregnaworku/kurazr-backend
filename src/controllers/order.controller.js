import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

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
    // Create Notification for Order Placed
    // =======================================

    await Notification.create({
      user: req.user._id,
      title: "🛍️ Order Placed Successfully",
      message: `Your order #${order.orderNumber} has been placed successfully. We will process it shortly.`,
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
// Admin - Update Order Status with Enhanced Notifications
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
    const previousStatus = order.orderStatus;

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
    // Create Notification for Customer based on status change
    // =======================================

    let notificationTitle = "";
    let notificationMessage = "";
    let notificationType = "order";

    switch (status) {
      case "Accepted":
        notificationTitle = "✅ Order Accepted";
        notificationMessage = `Your order #${order.orderNumber} has been accepted and is being prepared. We'll notify you when it's ready.`;
        break;
      case "Preparing":
        notificationTitle = "👨‍🍳 Order Being Prepared";
        notificationMessage = `Your order #${order.orderNumber} is currently being prepared by our team.`;
        break;
      case "Shipping":
        notificationTitle = "🚚 Order Shipped";
        notificationMessage = `Great news! Your order #${order.orderNumber} has been shipped and is on its way to you!`;
        break;
      case "Delivered":
        notificationTitle = "📦 Order Delivered";
        notificationMessage = `Your order #${order.orderNumber} has been delivered successfully. Thank you for shopping with Kuraz Design! ❤️`;
        break;
      case "Cancelled":
        notificationTitle = "❌ Order Cancelled";
        notificationMessage = `Your order #${order.orderNumber} has been cancelled. Reason: ${order.cancelReason || "Not specified"}`;
        break;
      default:
        notificationTitle = "📋 Order Updated";
        notificationMessage = `Your order #${order.orderNumber} status has been updated to ${status}.`;
    }

    // Only create notification if status actually changed
    if (status && previousStatus !== status) {
      await Notification.create({
        user: order.customer,
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        isRead: false,
      });
    }

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
      title: "🗑️ Order Deleted",
      message: `Your order #${order.orderNumber} has been removed by the administrator.`,
      type: "system",
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

// =======================================
// Admin - Get Order Statistics
// =======================================

export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({
      orderStatus: "Pending",
    });
    const acceptedOrders = await Order.countDocuments({
      orderStatus: "Accepted",
    });
    const preparingOrders = await Order.countDocuments({
      orderStatus: "Preparing",
    });
    const shippingOrders = await Order.countDocuments({
      orderStatus: "Shipping",
    });
    const deliveredOrders = await Order.countDocuments({
      orderStatus: "Delivered",
    });
    const cancelledOrders = await Order.countDocuments({
      orderStatus: "Cancelled",
    });

    const totalRevenue = await Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const monthlyRevenue = await Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 },
    ]);

    return res.json({
      success: true,
      stats: {
        total: totalOrders,
        pending: pendingOrders,
        accepted: acceptedOrders,
        preparing: preparingOrders,
        shipping: shippingOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue,
      },
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
// Admin - Notify All Users About New Product
// =======================================

export const notifyNewProduct = async (req, res) => {
  try {
    const { productId, productName, productImage } = req.body;

    // Get all users
    const users = await User.find().select("_id");

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found to notify",
      });
    }

    // Create notifications for all users
    const notifications = users.map((user) => ({
      user: user._id,
      title: "🆕 New Product Available!",
      message: `Check out our new arrival: ${productName}! Shop now before it's gone. 🛍️`,
      type: "promotion",
      isRead: false,
    }));

    await Notification.insertMany(notifications);

    return res.status(201).json({
      success: true,
      message: `${notifications.length} notifications sent to users`,
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
// Admin - Send Custom Promotion Notification
// =======================================

export const sendPromotionNotification = async (req, res) => {
  try {
    const { title, message, userIds } = req.body;

    let users;
    if (userIds && userIds.length > 0) {
      users = await User.find({ _id: { $in: userIds } }).select("_id");
    } else {
      users = await User.find().select("_id");
    }

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found to notify",
      });
    }

    const notifications = users.map((user) => ({
      user: user._id,
      title: title || "🎉 Special Promotion!",
      message:
        message || "Check out our latest offers and discounts at Kuraz Design!",
      type: "promotion",
      isRead: false,
    }));

    await Notification.insertMany(notifications);

    return res.status(201).json({
      success: true,
      message: `${notifications.length} promotion notifications sent`,
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
// Admin - Send Custom Notification to Specific User
// =======================================

export const sendCustomNotification = async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const notification = await Notification.create({
      user: userId,
      title: title || "📌 Notification",
      message: message || "You have a new notification from Kuraz Design.",
      type: type || "system",
      isRead: false,
    });

    return res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      notification,
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
// Admin - Bulk Update Order Status
// =======================================

export const bulkUpdateOrderStatus = async (req, res) => {
  try {
    const { orderIds, status } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide order IDs",
      });
    }

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { orderStatus: status },
    );

    // Create notifications for all affected orders
    const orders = await Order.find({ _id: { $in: orderIds } });

    const notifications = orders.map((order) => ({
      user: order.customer,
      title: `📋 Order Status Updated`,
      message: `Your order #${order.orderNumber} status has been updated to ${status}.`,
      type: "order",
      isRead: false,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return res.json({
      success: true,
      message: `${result.modifiedCount} orders updated successfully`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
