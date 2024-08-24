import express from "express";
import {
  registerController,
  loginController,
  tesController,
  forgotPasswordController,
  updateProfileController,
  updateStatusController,
  getAllOrdersControllerTwo,
  getAllaOrdersCOntroller,
} from "../controller/authController.js";
import { isAdmin, requireSignIn } from "../middleware/authMiddleware.js";

// Router object
const router = express.Router();

// Register route
router.post("/register", registerController);

// Login route
router.post("/login", loginController);

// Auth check for general users
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).json({ ok: true });
});

// Auth check for admins
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).json({ ok: true });
});

// Forgot password route
router.post("/forgot-password", forgotPasswordController);

// Test route (requires admin privileges)
router.get("/test", requireSignIn, isAdmin, tesController);

// update profile
router.put("/profile", requireSignIn, updateProfileController);

// order route
router.get("/orders", requireSignIn, getAllaOrdersCOntroller);

router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersControllerTwo);

router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  updateStatusController
);

export default router;
