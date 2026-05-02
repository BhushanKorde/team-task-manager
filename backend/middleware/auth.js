const jwt = require("jsonwebtoken");

/**
 * JWT Authentication Middleware
 * Extracts token from Authorization header, verifies it,
 * and attaches the decoded user payload to req.user.
 */
const auth = (req, res, next) => {
  try {
    // Expect header: "Bearer <token>"
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = auth;
