const express = require("express");
const router = express.Router();

const {
  createCompany,
  getAllCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
} = require("../../controller/companyController.js");

const { verifyAdminToken } = require("../../middleware/verifyAdminToken.js");
const { uploadMixed } = require("../../middleware/uploadMiddleware.js");

/* ================= CREATE ================= */
router.post(
  "/create",
  verifyAdminToken,
  uploadMixed, // 🔥 IMPORTANT
  createCompany
);

/* ================= GET ALL ================= */
router.get("/", verifyAdminToken, getAllCompanies);

/* ================= GET SINGLE ================= */
router.get("/:id", verifyAdminToken, getCompany);

/* ================= UPDATE ================= */
router.put(
  "/update/:id",
  verifyAdminToken,
  uploadMixed, // 🔥 IMPORTANT
  updateCompany
);

/* ================= DELETE ================= */
router.delete("/delete/:id", verifyAdminToken, deleteCompany);

module.exports = router;