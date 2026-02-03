const express = require("express");
const router = express.Router();
const { uploadMixed } = require("../middleware/uploadMiddleware.js");
const {
  uploadSliderImages,
  deleteSliderBySlug,
  updateSliderImages,
  getAllSliders
} = require("../controller/sliderController.js");

// ADMIN
router.post(
  "/:slug",
  uploadMixed,
  uploadSliderImages
);

router.delete("/:slug", deleteSliderBySlug);

router.put("/:slug", uploadMixed, updateSliderImages);

router.get("/all", getAllSliders);


module.exports = router;
