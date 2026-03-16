const express = require("express");
const router = express.Router();

const { uploadMixed } = require("../../middleware/uploadMiddleware.js");
const { verifyAdminToken } = require("../../middleware/verifyAdminToken.js");

const {
  getParentCatgoryBanner,
  createParentCatgoryBanner,
  getAllParentCatgoryBanners,
  updateParentCatgoryBanner,
  deleteParentCatgoryBanner
} = require("../../controller/parentcategoryBannerController.js");


/* ================= CREATE ================= */
router.post("/create",verifyAdminToken, uploadMixed, createParentCatgoryBanner);


/* ================= GET SINGLE BY SLUG ================= */
/* Example: /banner/mesh-router */
router.get("/banner/:parentCategory",verifyAdminToken, getParentCatgoryBanner);


/* ================= GET ALL ================= */
router.get("/all",verifyAdminToken, getAllParentCatgoryBanners);


/* ================= UPDATE ================= */
router.put("/update/:id", verifyAdminToken,uploadMixed, updateParentCatgoryBanner);


/* ================= DELETE ================= */
router.delete("/delete/:id",verifyAdminToken, deleteParentCatgoryBanner);


module.exports = router;