const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// ──────────────────────────────────────────────
// POST /api/auth/signup  —  Register a new member
// ──────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // --- Validation ---
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

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with role = member (signup never creates admins)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "member",
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ──────────────────────────────────────────────
// POST /api/auth/login  —  Authenticate user
// ──────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Validation ---
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password." });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

module.exports = router;
