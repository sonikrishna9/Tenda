const express = require("express");
const {
  createGallery,
  updateGallery,
  deleteGallery,
  getGalleryBySlug,
  getAllGalleries,
} = require("../controller/gallerycontroller.js");

const { uploadMixed } = require("../middleware/uploadMiddleware.js");

const router = express.Router();

/* CREATE */
router.post("/create", uploadMixed, createGallery);

/* READ */
router.get("/get-all", getAllGalleries);
router.get("/single/:slug", getGalleryBySlug);

/* UPDATE */
router.put("/update/:id", uploadMixed, updateGallery);

/* DELETE */
router.delete("/delete/:id", deleteGallery);

module.exports = router;