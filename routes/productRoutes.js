import express from "express";
import { isAdmin, requireSignIn } from "../middleware/authMiddleware.js";
import formidable from "express-formidable";
import {
  braintreePaymentController,
  braintreeTokenController,
  createProductController,
  deleteProductController,
  getProductByPhotoController,
  getProductsController,
  getSingleProductController,
  productCategoryController,
  productCountController,
  productFilterControler,
  productListControler,
  updateProductController,
} from "../controller/productController.js";
const router = express.Router();

// routes
router.post("/create-product", formidable(), createProductController);

// to gett all the products
router.get("/get-product", getProductsController);

// to get single product ||GET
router.get("/get-single-product/:slug", getSingleProductController);

// get phto
router.get("/product-photo/:pid", getProductByPhotoController);

// delete  product controler
router.delete("/delete-product/:pid", deleteProductController);

// filer product
router.post("/product-filters", productFilterControler);
// update route ||post
router.put("/update-product/:pid", formidable(), updateProductController);

// count products
router.get("/product-count", productCountController);

// product per page
router.get("/product-list/:page", productListControler);

router.get("/product-category/:slug", productCategoryController);

// /PAYMENT ROUTE'
router.get("/braintree/token", braintreeTokenController);

// payments
router.post("/braintree/payment", requireSignIn, braintreePaymentController);
export default router;
