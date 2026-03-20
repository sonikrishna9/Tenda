const express = require("express");
const router = express.Router();

const {
  upsertVideos,
  getVideosBySlug,
  getAllVideos,
  deleteBySlug,
} = require("../../controller/VideoController.js");

const { verifyAdminToken } = require("../../middleware/verifyAdminToken.js");




// CREATE / UPDATE
router.post("/", verifyAdminToken, upsertVideos);

// GET ALL
router.get("/", verifyAdminToken, getAllVideos);

// GET BY SLUG
router.get("/:slug", verifyAdminToken, getVideosBySlug);

// DELETE
router.delete("/:slug", verifyAdminToken, deleteBySlug);

module.exports = router;