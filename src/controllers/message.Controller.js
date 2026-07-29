import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// =======================================
// Send Message
// =======================================

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty.",
      });
    }

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found.",
      });
    }

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      message,
      isRead: false,
    });

    await Notification.create({
      user: receiverId,
      title: "New Message",
      message: `${req.user.fullName} sent you a message.`,
      type: "message",
      isRead: false,
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: newMessage,
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
      .sort({ createdAt: -1 });

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
