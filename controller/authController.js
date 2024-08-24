import { comparePassword, hashPassword } from "../helper/authHelper.js";
import OrderModel from "../models/OrderModel.js";
import userModels from "../models/userModels.js";
import jwt from "jsonwebtoken";

// Register the user
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;

    // Validation
    if (!name || !email || !password || !phone || !address || !answer) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check user
    const existingUser = await userModels.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists, please login",
      });
    }

    // Register user
    const hashedPassword = await hashPassword(password);
    const user = new userModels({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        answer: user.answer,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Login controller POST method
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Check user
    const user = await userModels.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// TEST CONTROLLER
export const tesController = (req, res) => {
  try {
    res.status(200).json({ message: "Protected route accessed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in test route",
      error: error.message,
    });
  }
};

// forgot passwrod contoller
export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email) {
      res.status(400).send({
        message: "Email is required",
      });
    }
    if (!answer) {
      res.status(400).send({
        message: "Question is required",
      });
    }
    if (!newPassword) {
      res.status(400).send({
        message: "password is required",
      });
    }

    // check
    const user = await userModels.findOne({ email, answer });
    // validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong Email or Answer",
      });
    }
    const hashed = await hashPassword(newPassword);
    await userModels.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password reset succesfully!!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Sowmthing went Wrong",
      error,
    });
  }
};

// update profile controller

export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await userModels.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Password check
    if (password && password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be more than 6 characters long" });
    }

    // Hash the password if it exists in the request body
    const hashedPassword = password
      ? await hashPassword(password)
      : user.password;

    // Update the user information
    const updatedUser = await userModels.findByIdAndUpdate(
      userId,
      {
        name: name || user.name,
        email: email || user.email,
        password: hashedPassword,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Cannot update the user profile",
    });
  }
};

// etAllaOrdersCOntroller

export const getAllaOrdersCOntroller = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const orders = await OrderModel.find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");

    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Orders Not fetched",
      error,
    });
  }
};

export const getAllOrdersControllerTwo = async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Fetch all orders from the database
    const orders = await OrderModel.find({})
      .populate("products", "-photo") // Populate 'products' field but exclude 'photo'
      .populate("buyer", "name") // Populate 'buyer' field with 'name'
      .sort({ createdAt: -1 }); // Sort orders by creation date in descending order

    // Send the orders as JSON response
    res.json(orders);
  } catch (error) {
    console.error(error); // Use console.error for error logging
    res.status(500).json({
      // Use .json() for consistency
      success: false,
      message: "Orders not fetched",
      error,
    });
  }
};

export const updateStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate input
    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and status are required",
      });
    }

    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Respond with the updated order
    res.json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error,
    });
  }
};
