const express = require("express");
const router = express.Router();

const { uploadMixed } = require("../../middleware/uploadMiddleware.js");

const {
    getSubCategoryBanner,
    createSubCategoryBanner,
    getAllSubCategoryBanners,
    updateSubCategoryBanner,
    deleteSubCategoryBanner
} = require("../../controller/subcategoryBannerController.js");
const { verifyAdminToken } = require("../../middleware/verifyAdminToken.js");

/* CREATE */
router.post("/create", verifyAdminToken, uploadMixed, createSubCategoryBanner);

/* GET SINGLE BY SLUG */
router.get("/banner/:parentCategory/:subCategory", verifyAdminToken, getSubCategoryBanner);

/* GET ALL */
router.get("/all", verifyAdminToken, getAllSubCategoryBanners);

/* UPDATE */
router.put("/update/:id", verifyAdminToken, uploadMixed, updateSubCategoryBanner);

/* DELETE */
router.delete("/delete/:id", verifyAdminToken, deleteSubCategoryBanner);

module.exports = router;