const express = require("express")
const { createparentcategory, getcategory, updatecategory, deletecategory } = require("../../controller/parentcategorycontroller.js")
const { uploadMixed } = require("../../middleware/uploadMiddleware");
const { verifyAdminToken } = require("../../middleware/verifyAdminToken.js");

const router = express.Router()

router.post("/create", verifyAdminToken, uploadMixed, createparentcategory)

router.get('/getall', verifyAdminToken, getcategory)

router.put('/update/:id', verifyAdminToken, uploadMixed, updatecategory)
router.delete('/:id', verifyAdminToken, uploadMixed, deletecategory)

module.exports = router;