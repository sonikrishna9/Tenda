const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  createCompany,
  getAllCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
} = require("../controller/companyController.js");

const storage = multer.memoryStorage();

const upload = multer({ storage });

router.post("/create", upload.single("logo"), createCompany);

router.get("/", getAllCompanies);

router.get("/:id", getCompany);

router.put("/update/:id", upload.single("logo"), updateCompany);

router.delete("/delete/:id", deleteCompany);

module.exports = router;