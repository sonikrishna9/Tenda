const express = require("express");
const router = express.Router();

const {
  createSEO,
  getAllSEO,
  getSEOBySlug,
  updateSEO,
  deleteSEO,
} = require("../../controller/seo.controller.js");
const { verifyAdminToken } = require("../../middleware/verifyAdminToken.js");

router.post("/seo", verifyAdminToken, createSEO);
router.get("/seo", verifyAdminToken, getAllSEO);
router.get("/seo-entry", verifyAdminToken, getSEOBySlug);
router.get("/seo/:slug", verifyAdminToken, getSEOBySlug);
router.put("/seo/:id", verifyAdminToken, updateSEO);
router.delete("/seo/:id", verifyAdminToken, deleteSEO);

module.exports = router;
