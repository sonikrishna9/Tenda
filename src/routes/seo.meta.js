const express = require("express");
const router = express.Router();

const { getAllSEO, getSEOBySlug } = require("../controller/seo.controller.js");

router.get("/seo", getAllSEO);
router.get("/seo-entry", getSEOBySlug);
router.get("/seo/:slug", getSEOBySlug);

module.exports = router;
