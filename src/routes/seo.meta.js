const express = require("express");
const router = express.Router();

const {
  getAllSEO,
  getSEOBySlug,
} = require("../controller/seo.controller.js");



// ➤ GET ALL
router.get("/seo",getAllSEO);

// ➤ GET BY SLUG
router.get("/seo/:slug",getSEOBySlug);


module.exports = router;