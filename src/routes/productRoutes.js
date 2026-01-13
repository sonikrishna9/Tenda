const express = require("express");
const {
  uploadSingle,
  uploadMultiple,
} = require("../middleware/uploadMiddleware");

const { createProduct, getProduct, getallProducts } = require("../controller/productController.js");

const router = express.Router();

/**
 * SINGLE IMAGE PRODUCT
 */
router.post(
  "/single",
  uploadSingle,
  createProduct
);

/**
 * MULTIPLE IMAGE PRODUCT
 */
router.post(
  "/multiple",
  uploadMultiple,
  createProduct
);

router.get("/allproducts", getallProducts)

router.get("/single-product/:parentCategory/:subCategory", getProduct)

module.exports = router;
