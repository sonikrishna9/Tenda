const express = require("express");
const router = express.Router();

const {
  upsertVideos,
  getVideosBySlug,
  getAllVideos,
  deleteBySlug,
} = require("../controller/VideoController.js");



// CREATE / UPDATE
router.post("/",upsertVideos);

// GET ALL
router.get("/", getAllVideos);

// GET BY SLUG
router.get("/:slug", getVideosBySlug);

// DELETE
router.delete("/:slug", deleteBySlug);

module.exports = router;