const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// ──────────────────────────────────────────────
// POST /api/admin/create-admin  —  Create a new admin (Admin only)
// ──────────────────────────────────────────────
router.post("/create-admin", auth, async (req, res) => {
  try {
    // Only existing admins can create new admins
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Only admins can create new admins." });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, email, and password." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    // Check for existing email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Email already exists. Please use a different email." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "admin",
    });

    return res.status(201).json({
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ──────────────────────────────────────────────
// GET /api/admin/members  —  Get all members (Admin only)
//   Used for assigning members to projects
// ──────────────────────────────────────────────
router.get("/members", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied." });
    }

    const members = await User.find({ role: "member" }).select("name email _id");
    return res.status(200).json({ members });
  } catch (error) {
    console.error("Get members error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

module.exports = router;
