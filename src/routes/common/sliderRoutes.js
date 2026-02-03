const express = require("express");
const router = express.Router();
const {
  getSliderBySlug,
} = require("../../controller/sliderController.js");

// FRONTEND
router.get("/:slug", getSliderBySlug);

module.exports = router;
