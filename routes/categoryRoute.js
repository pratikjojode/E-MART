import { isAdmin, requireSignIn } from "../middleware/authMiddleware.js";
import express from "express";
import {
  categoryController,
  createCtegoryController,
  deleteCategory,
  getsingleCategory,
  updateCategoryController,
} from "../controller/CategoryController.js";
const router = express.Router();

// routes for creatingn acatgory
router.post(
  "/create-category",
  createCtegoryController,
  updateCategoryController,
  categoryController,
  getsingleCategory,
  deleteCategory
);

// route for update category
router.put(
  "/update-category/:id",

  updateCategoryController
);

// get all category || GET
router.get("/get-category", categoryController);

// single category ||GET method
router.get("/single-category/:slug", getsingleCategory);

// delelet route ||DDELETE
router.delete("/delete-category/:id", deleteCategory);
export default router;
