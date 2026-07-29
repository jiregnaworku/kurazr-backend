import User from "../models/User.js";

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch users.",
    });
  }
};

// Get one user
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch user.",
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { fullName, phone, email, address, role, isVerified, profileImage } =
      req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    user.fullName = fullName ?? user.fullName;
    user.phone = phone ?? user.phone;
    user.email = email ?? user.email;
    user.address = address ?? user.address;
    user.role = role ?? user.role;
    user.isVerified = isVerified ?? user.isVerified;
    user.profileImage = profileImage ?? user.profileImage;

    await user.save();

    res.status(200).json({
      message: "User updated successfully.",
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update user.",
    });
  }
};

// Block / Unblock user
export const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    user.isBlocked = !user.isBlocked;

    await user.save();

    res.status(200).json({
      message: user.isBlocked
        ? "User blocked successfully."
        : "User unblocked successfully.",
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update user status.",
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete user.",
    });
  }
};
