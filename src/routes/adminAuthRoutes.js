const express = require("express");

const {
    adminLogin,
    registerAdmin,
    resetPassword
} = require("../controller/adminAuthController");

const { verifyAdminToken } = require("../middleware/verifyAdminToken");

const router = express.Router();

/* LOGIN */
router.post("/login", adminLogin);

/* REGISTER */
router.post("/register", verifyAdminToken, registerAdmin);

router.post("/reset-password", verifyAdminToken, resetPassword);


module.exports = router;
