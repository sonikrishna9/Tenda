const express = require("express");
const router = express.Router();

const { uploadMixed } = require("../middleware/uploadMiddleware.js");

const {
  getSubCategoryBanner,
  createSubCategoryBanner,
  getAllSubCategoryBanners,
  updateSubCategoryBanner,
  deleteSubCategoryBanner
} = require("../controller/subcategoryBannerController.js");

/* CREATE */
router.post("/create", uploadMixed, createSubCategoryBanner);

/* GET SINGLE BY SLUG */
router.get("/banner/:parentCategory/:subCategory", getSubCategoryBanner);

/* GET ALL */
router.get("/all", getAllSubCategoryBanners);

/* UPDATE */
router.put("/update/:id", uploadMixed, updateSubCategoryBanner);

/* DELETE */
router.delete("/delete/:id", deleteSubCategoryBanner);

module.exports = router;