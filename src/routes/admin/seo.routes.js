// routes/seo.routes.js

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


// ➤ CREATE
router.post("/seo", verifyAdminToken,createSEO);

// ➤ GET ALL
router.get("/seo", verifyAdminToken,getAllSEO);

// ➤ GET BY SLUG
router.get("/seo/:slug", verifyAdminToken,getSEOBySlug);

// ➤ UPDATE
router.put("/seo/:id", verifyAdminToken,updateSEO);

// ➤ DELETE
router.delete("/seo/:id", verifyAdminToken,deleteSEO);

module.exports = router;