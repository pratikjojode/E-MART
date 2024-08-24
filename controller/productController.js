import ProductModels from "../models/ProductModels.js";
import fs from "fs";
import slugify from "slugify";
import CategoryModel from "../models/CategoryModel.js";
import braintree from "braintree";
import dotenv from "dotenv";
import OrderModel from "../models/OrderModel.js";
dotenv.config();
// Create Product Controller
export const createProductController = async (req, res) => {
  try {
    const { name, description, category, quantity, price, shipping } =
      req.fields;
    const { photo } = req.files;

    // Validation
    if (!name) return res.status(400).send({ error: "Name is required!!" });
    if (!quantity)
      return res.status(400).send({ error: "Quantity is required!!" });
    if (!price) return res.status(400).send({ error: "Price is required!!" });
    if (!shipping)
      return res.status(400).send({ error: "Shipping is required!!" });
    if (!description)
      return res.status(400).send({ error: "Description is required!!" });
    if (!category)
      return res.status(400).send({ error: "Category is required!!" });
    if (!photo || photo.size > 1000000)
      return res
        .status(400)
        .send({ error: "Photo is required and should be less than 1MB" });

    // Create a new product instance
    const product = new ProductModels({
      ...req.fields,
      slug: slugify(name),
    });

    // Handle photo upload
    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.mimetype;
    }

    await product.save();

    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong while creating the product",
      error: error.message,
    });
  }
};

// Get All Products Controller
export const getProductsController = async (req, res) => {
  try {
    // Fetch products with category details populated
    const products = await ProductModels.find({})
      .populate("category")
      .select("-photo") // Exclude photo field if not needed
      .limit(12) // Limit the number of products returned
      .sort({ createdAt: -1 }); // Sort products by creation date in descending order

    // Send response with products data
    res.status(200).json({
      success: true,
      total: products.length,
      message: "Found all the products",
      products, // Send the products data
    });
  } catch (error) {
    // Log and send error details
    console.error("Error finding products:", error);
    res.status(500).json({
      success: false,
      message: "Error finding products",
      error: error.message,
    });
  }
};

// Get Single Product Controller
export const getSingleProductController = async (req, res) => {
  try {
    const product = await ProductModels.findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Fetched the single product",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Cannot get the single product",
      error: error.message,
    });
  }
};

// Get Product Photo Controller
export const getProductByPhotoController = async (req, res) => {
  try {
    const product = await ProductModels.findById(req.params.pid).select(
      "photo"
    );

    if (!product || !product.photo.data) {
      return res.status(404).send({
        success: false,
        message: "Photo not found",
      });
    }

    res.set("Content-Type", product.photo.contentType);
    res.status(200).send(product.photo.data);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Cannot fetch the product photo",
      error: error.message,
    });
  }
};

// delete product model
export const deleteProductController = async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await ProductModels.findByIdAndDelete(pid).select("-photo");
    return res.status(200).send({
      success: true,
      message: "product deleted succesfully!",
      product,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "someting went wromg cannot delete the product",
      error,
    });
  }
};

// Update Product Controller
export const updateProductController = async (req, res) => {
  try {
    const { name, description, category, quantity, price, shipping } =
      req.fields || {};
    const { photo } = req.files || {};

    // Find the existing product
    const product = await ProductModels.findById(req.params.pid);

    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) {
      if (typeof category === "string") {
        product.category = category; // Ensure category is a valid ObjectId if necessary
      } else {
        return res.status(400).send({ error: "Invalid category" });
      }
    }
    if (quantity) product.quantity = parseInt(quantity, 10); // Ensure quantity is a number
    if (price) product.price = parseFloat(price); // Ensure price is a number
    if (shipping !== undefined) product.shipping = shipping === "Yes"; // Convert to boolean

    // Handle photo upload
    if (photo) {
      if (!photo.filepath) {
        return res.status(400).send({ error: "Photo file path is missing" });
      }
      if (photo.size > 1000000) {
        return res.status(400).send({ error: "Photo should be less than 1MB" });
      }
      product.photo.data = fs.readFileSync(photo.filepath);
      product.photo.contentType = photo.mimetype;
    }

    // Update slug if name is changed
    if (name) product.slug = slugify(name);

    await product.save();

    res.status(200).send({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error); // More descriptive logging
    res.status(500).send({
      success: false,
      message: "Something went wrong while updating the product",
      error: error.message,
    });
  }
};

// filer product

export const productFilterControler = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await ProductModels.find(args);
    res.status(200).send({
      success: true,
      message: "Filtered succesfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while filtering produyct",
      error,
    });
  }
};

// product count controller
export const productCountController = async (req, res) => {
  try {
    const total = await ProductModels.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      message: "Count fetched sucessfully",
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in product count",
    });
  }
};

export const productListControler = async (req, res) => {
  try {
    const perPage = 2;
    const page = req.params.page ? req.params.page : 1;
    const product = (await ProductModels.find({}))
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: "Product pagination succesfully",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in per page",
    });
  }
};

// ger product category

export const productCategoryController = async (req, res) => {
  try {
    const category = await CategoryModel.findOne({ slug: req.params.slug });
    const product = await ProductModels.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      message: "Task suucefully got the produvts",
      category,
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong on getting product on cat",
    });
  }
};

// gateway fro payment\
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

// pyment controller ghateway
// token
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

// paymnet conteroler

// Payment Controller
export const braintreePaymentController = async (req, res) => {
  try {
    const { cart, nonce } = req.body;
    let total = 0;

    // Calculate total price
    cart.map((item) => {
      total += item.price;
    });

    // Create a new transaction
    gateway.transaction.sale(
      {
        amount: total.toFixed(2),
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      async (err, result) => {
        if (err) {
          return res.status(500).send({ error: err.message });
        }

        if (result.success) {
          // Save order to the database
          const order = new OrderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          });

          await order.save();

          return res.status(200).send({
            success: true,
            message: "Transaction successful",
            order,
          });
        } else {
          return res.status(500).send({ error: "Transaction failed" });
        }
      }
    );
  } catch (error) {
    console.log("Payment error:", error);
    return res.status(500).send({
      success: false,
      message: "Something went wrong during the transaction",
      error: error.message,
    });
  }
};
