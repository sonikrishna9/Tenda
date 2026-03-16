const express = require("express");
const {
    createGallery,
    updateGallery,
    deleteGallery,
    getGalleryBySlug,
    getAllGalleries,
} = require("../../controller/gallerycontroller.js");

const { uploadMixed } = require("../../middleware/uploadMiddleware.js");
const { verifyAdminToken } = require("../../middleware/verifyAdminToken.js");

const router = express.Router();

/* CREATE */
router.post("/create", verifyAdminToken, uploadMixed, createGallery);

/* READ */
router.get("/get-all", verifyAdminToken, getAllGalleries);
router.get("/single/:slug", verifyAdminToken, getGalleryBySlug);

/* UPDATE */
router.put("/update/:id", verifyAdminToken, uploadMixed, updateGallery);

/* DELETE */
router.delete("/delete/:id", verifyAdminToken, deleteGallery);

module.exports = router;