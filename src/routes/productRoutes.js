const express = require("express");
const { uploadMixed } = require("../middleware/uploadMiddleware");

const {
  createProduct,
  getProduct,
  getallProducts,
  updateProduct,
  getfeaturedProduts
} = require("../controller/productController.js");

const router = express.Router();

/* CREATE PRODUCT */
router.post(
  "/createproduct",
  uploadMixed,
  createProduct
);

/* GET ALL PRODUCTS */
router.get("/allproducts", getallProducts);

/* GET SINGLE PRODUCT */
router.get("/single-product/:parentCategory/:subCategory", getProduct);
router.get("/featuredproducts", getfeaturedProduts);

/* UPDATE PRODUCT */
router.put(
  "/update/:id",
  uploadMixed,
  updateProduct
);

module.exports = router;
