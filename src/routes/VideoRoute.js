const express = require("express");
const router = express.Router();

const {
  upsertVideos,
  getVideosBySlug,
  getAllVideos,
  deleteBySlug,
} = require("../controller/VideoController.js");

// ROUTES
router.post("/create", upsertVideos);
router.get("/getall", getAllVideos);
router.get("/update/:slug", getVideosBySlug);
router.delete("/delete/:slug", deleteBySlug);

// ✅ EXPORT CORRECTLY
module.exports = router;