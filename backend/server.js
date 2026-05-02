const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const projectRoutes = require("./routes/projects");
const adminRoutes = require("./routes/admin");
const User = require("./models/User");

// ──────────────────────────────────────────────
// Initialize Express
// ──────────────────────────────────────────────
const app = express();

// ──────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ──────────────────────────────────────────────
// Health Check
// ──────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "API running" });
});

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/admin", adminRoutes);

// ──────────────────────────────────────────────
// Create Default Admin
// ──────────────────────────────────────────────
const createDefaultAdmin = async () => {
  try {
    const adminEmail = "admin@test.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      await User.create({
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });

      console.log("✅ Default admin created (admin@test.com / admin123)");
    } else {
      console.log("ℹ️  Default admin already exists.");
    }
  } catch (error) {
    console.error("❌ Error creating default admin:", error.message);
  }
};

// ──────────────────────────────────────────────
// Connect to MongoDB & Start Server
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected successfully");

    // Seed default admin after DB connection is ready
    await createDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  });
