const express = require("express");
const router = express.Router();
const { uploadMixed } = require("../../middleware/uploadMiddleware.js");
const {
    uploadSliderImages,
    deleteSliderBySlug,
    updateSliderImages,
    getAllSliders
} = require("../../controller/sliderController.js");
const { verifyAdminToken } = require("../../middleware/verifyAdminToken.js");

// ADMIN
router.post(
    "/:slug",
    verifyAdminToken,
    uploadMixed,
    uploadSliderImages
);

router.delete("/:slug", verifyAdminToken, deleteSliderBySlug);

router.put("/:slug", verifyAdminToken, uploadMixed, updateSliderImages);

router.get("/all", verifyAdminToken, getAllSliders);


module.exports = router;
