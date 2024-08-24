import JWT from "jsonwebtoken";
import userModels from "../models/userModels.js";

// Middleware to check if user is signed in
export const requireSignIn = async (req, res, next) => {
  try {
    // Check for authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided or invalid token format",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify token
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("Decoded Token:", decoded); // Log decoded token for debugging
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Middleware to check if user is an admin
export const isAdmin = async (req, res, next) => {
  try {
    // Ensure user is available
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Fetch user details
    const user = await userModels.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("User from token:", req.user); // Log user from token for debugging
    console.log("Fetched user from database:", user); // Log fetched user for debugging

    // Check for admin role
    if (user.role !== 1) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have admin privileges",
      });
    }

    next();
  } catch (error) {
    console.error("Admin check error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error in admin middleware",
      error: error.message,
    });
  }
};
