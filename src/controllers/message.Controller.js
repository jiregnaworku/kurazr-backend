import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { io } from "../server.js";

// =======================================
// Send Message
// =======================================

export const sendMessage = async (req, res) => {
  try {
    const { message, receiverId } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty.",
      });
    }

    let receiver;

    // =======================================
    // CUSTOMER -> ADMIN
    // =======================================

    if (req.user.role !== "admin") {
      receiver = await User.findOne({
        role: "admin",
      });

      if (!receiver) {
        return res.status(404).json({
          success: false,
          message: "Admin account not found.",
        });
      }
    }

    // =======================================
    // ADMIN -> CUSTOMER
    // =======================================
    else {
      if (!receiverId) {
        return res.status(400).json({
          success: false,
          message: "Receiver ID is required.",
        });
      }

      receiver = await User.findById(receiverId);

      if (!receiver) {
        return res.status(404).json({
          success: false,
          message: "Customer not found.",
        });
      }
    }

    // =======================================
    // Save Message
    // =======================================

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiver._id,
      message,
      isRead: false,
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "fullName role")
      .populate("receiver", "fullName role");

    // =======================================
    // Notification
    // =======================================

    await Notification.create({
      user: receiver._id,
      title: "New Message",
      message: `${req.user.fullName} sent you a message.`,
      type: "message",
      isRead: false,
    });

    // =======================================
    // Socket.IO
    // =======================================

    io.to(receiver._id.toString()).emit("receiveMessage", populatedMessage);

    io.to(req.user._id.toString()).emit("receiveMessage", populatedMessage);

    io.to(receiver._id.toString()).emit("newNotification", {
      title: "New Message",
      message: `${req.user.fullName} sent you a message.`,
      type: "message",
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: populatedMessage,
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
// Get Conversation
// =======================================

export const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        {
          sender: req.user._id,
          receiver: userId,
        },
        {
          sender: userId,
          receiver: req.user._id,
        },
      ],
    })
      .populate("sender", "fullName role")
      .populate("receiver", "fullName role")
      .sort({ createdAt: 1 });

    return res.json({
      success: true,
      messages,
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
// Get My Messages
// =======================================

export const getMyMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        {
          sender: req.user._id,
        },
        {
          receiver: req.user._id,
        },
      ],
    })
      .populate("sender", "fullName role")
      .populate("receiver", "fullName role")
      .sort({ createdAt: 1 });

    return res.json({
      success: true,
      messages,
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
// Mark Message as Read
// =======================================

export const markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    message.isRead = true;

    await message.save();

    io.to(message.sender.toString()).emit("messageRead", message._id);

    return res.json({
      success: true,
      message: "Message marked as read.",
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
// Delete Message
// =======================================

export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    if (
      message.sender.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized.",
      });
    }

    await message.deleteOne();

    io.to(message.receiver.toString()).emit("messageDeleted", message._id);

    io.to(message.sender.toString()).emit("messageDeleted", message._id);

    return res.json({
      success: true,
      message: "Message deleted successfully.",
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
// Get Customers Who Messaged Admin
// =======================================

export const getAdminConversations = async (req, res) => {
  try {
    const adminId = req.user._id;

    const messages = await Message.find({
      $or: [
        {
          sender: adminId,
        },
        {
          receiver: adminId,
        },
      ],
    })
      .populate("sender", "fullName email role")
      .populate("receiver", "fullName email role")
      .sort({
        createdAt: -1,
      });

    const conversations = {};

    messages.forEach((msg) => {
      let customer;

      // customer who is not admin

      if (msg.sender.role !== "admin") {
        customer = msg.sender;
      } else {
        customer = msg.receiver;
      }

      if (!customer) return;

      if (!conversations[customer._id]) {
        conversations[customer._id] = {
          user: customer,

          lastMessage: msg.message,

          lastMessageTime: msg.createdAt,

          unread: 0,
        };
      }

      // count unread customer messages

      if (msg.receiver._id.toString() === adminId.toString() && !msg.isRead) {
        conversations[customer._id].unread++;
      }
    });

    return res.json({
      success: true,

      conversations: Object.values(conversations),
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
