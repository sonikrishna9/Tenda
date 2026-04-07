const express = require("express");
const { uploadMixed } = require("../middleware/uploadMiddleware");
const { verifyAdminToken } = require("../middleware/verifyAdminToken.js");
const {
  createProduct,
  getProduct,
  getallProducts,
  getallfrontendparentcategory,
  getallProductsFrontend,
  updateProduct,
  getFeaturedProducts,
  deleteProduct,
  getallparentcategory
} = require("../controller/productController.js");

const router = express.Router();


// Admin get routes

router.get("/all-categories", getallfrontendparentcategory);


/* CREATE PRODUCT */
router.post(
  "/createproduct",
  verifyAdminToken,
  uploadMixed,
  createProduct
);

/* GET ALL PRODUCTS */
router.get("/allproducts", getallProductsFrontend);

/* GET SINGLE PRODUCT */
// example
router.get(
  "/single-product/:parentCategory/:productTitle",
  getProduct
);

router.get("/featuredproducts", getFeaturedProducts);
router.get("/all-categories", getallparentcategory);
router.delete("/delete/:id", deleteProduct);


/* UPDATE PRODUCT */
router.put(
  "/update/:id",
  uploadMixed,
  updateProduct
);

module.exports = router;
