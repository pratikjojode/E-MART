import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDb from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import categoryRoutes from "./routes/categoryRoute.js";
import productRoutes from "./routes/productRoutes.js";
const PORT = process.env.PORT || 8080;
const path = require("path");
dotenv.config();
connectDb();

// rest object
const app = express();
// moragn middle

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// static files
app.use(express.static(path.join(__dirname, "./client/build")));

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/products", productRoutes);

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});
// rest api

app.get("/", (req, res) => {
  res.send("<h1>Hello welcome to the ecommerce app</h1>");
});
// listent hre server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`.bgBlack.white);
});
