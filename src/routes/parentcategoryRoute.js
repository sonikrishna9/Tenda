const express = require("express")
const { createparentcategory, getcategory, updatecategory } = require("../controller/parentcategorycontroller.js")
const { uploadMixed } = require("../middleware/uploadMiddleware");

const router = express.Router()

router.post("/create", uploadMixed, createparentcategory)

router.get('/getall', getcategory)

router.put('/update/:id', uploadMixed, updatecategory)

module.exports = router;