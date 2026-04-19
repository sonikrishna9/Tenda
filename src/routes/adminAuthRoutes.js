const express = require("express");

const {
  adminLogin,
  registerAdmin,
  resetPassword,
  adminLogout,
  getAdmins,
} = require("../controller/adminAuthController");

const { verifyAdminToken } = require("../middleware/verifyAdminToken");

const router = express.Router();

router.post("/login", adminLogin);
router.post("/register", registerAdmin);
router.get("/list", verifyAdminToken, getAdmins);
router.post("/reset-password", verifyAdminToken, resetPassword);
router.post("/logout", adminLogout);

module.exports = router;
