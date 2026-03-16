const express = require("express");
const { uploadMixed } = require("../../middleware/uploadMiddleware.js");
const { verifyAdminToken } = require("../../middleware/verifyAdminToken.js");
const {
  createProduct,
  getProduct,
  getallProducts,
  updateProduct,
  getFeaturedProducts,
  deleteProduct,
  getallparentcategory
} = require("../../controller/productController.js");

const router = express.Router();


// Admin get routes



/* CREATE PRODUCT */
router.post(
  "/createproduct",
  verifyAdminToken,
  uploadMixed,
  createProduct
);

/* GET ALL PRODUCTS */
router.get("/allproducts",verifyAdminToken, getallProducts);

/* GET SINGLE PRODUCT */
// example
router.get(
  "/single-product/:parentCategory/:productTitle",
  verifyAdminToken,
  getProduct
);

router.get("/featuredproducts", verifyAdminToken,getFeaturedProducts);
router.get("/all-categories",verifyAdminToken, getallparentcategory);
router.delete("/delete/:id",verifyAdminToken, deleteProduct);


/* UPDATE PRODUCT */
router.put(
  "/update/:id",
  uploadMixed,
  verifyAdminToken,
  updateProduct
);

module.exports = router;
