import bcrypt from "bcrypt";
import User from "../models/User.js";

// GET PROFILE
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phone, address } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Prevent duplicate phone numbers
    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({
        phone,
        _id: { $ne: user._id },
      });

      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: "Phone number already exists.",
        });
      }
    }

    // Prevent duplicate emails
    if (email && email !== user.email) {
      const emailExists = await User.findOne({
        email,
        _id: { $ne: user._id },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists.",
        });
      }
    }

    user.fullName = fullName;
    user.email = email;
    user.phone = phone;
    user.address = address;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both passwords are required.",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const match = await bcrypt.compare(currentPassword, user.password);

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE ACCOUNT
export const deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);

    res.json({
      success: true,
      message: "Account deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
