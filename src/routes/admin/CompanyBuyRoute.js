const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
    createCompany,
    getAllCompanies,
    getCompany,
    updateCompany,
    deleteCompany,
} = require("../../controller/companyController.js");
const { verifyAdminToken } = require("../../middleware/verifyAdminToken.js");

const storage = multer.memoryStorage();

const upload = multer({ storage });

router.post("/create", verifyAdminToken, upload.single("logo"), createCompany);

router.get("/", verifyAdminToken, getAllCompanies);

router.get("/:id", verifyAdminToken, getCompany);

router.put("/update/:id", verifyAdminToken, upload.single("logo"), updateCompany);

router.delete("/delete/:id", verifyAdminToken, deleteCompany);

module.exports = router;