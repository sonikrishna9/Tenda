const express = require("express");
const router = express.Router();

const { uploadMixed } = require("../middleware/uploadMiddleware.js");

const {
  getParentCatgoryBanner,
  createParentCatgoryBanner,
  getAllParentCatgoryBanners,
  updateParentCatgoryBanner,
  deleteParentCatgoryBanner
} = require("../controller/parentcategoryBannerController.js");


/* ================= CREATE ================= */
router.post("/create", uploadMixed, createParentCatgoryBanner);


/* ================= GET SINGLE BY SLUG ================= */
/* Example: /banner/mesh-router */
router.get("/banner/:parentCategory", getParentCatgoryBanner);


/* ================= GET ALL ================= */
router.get("/all", getAllParentCatgoryBanners);


/* ================= UPDATE ================= */
router.put("/update/:id", uploadMixed, updateParentCatgoryBanner);


/* ================= DELETE ================= */
router.delete("/delete/:id", deleteParentCatgoryBanner);


module.exports = router;