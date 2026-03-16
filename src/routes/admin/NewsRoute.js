const express = require("express");
const router = express.Router();

const newsController = require("../../controller/newscontroller.js");
const { uploadMixed } = require("../../middleware/uploadMiddleware.js");
const { verifyAdminToken } = require("../../middleware/verifyAdminToken.js");

/* CREATE */
router.post("/create", verifyAdminToken, uploadMixed, newsController.createNews);

/* GET ALL */
router.get("/all", verifyAdminToken, newsController.getAllNews);

/* GET BY SLUG */
router.get("/:slug", verifyAdminToken, newsController.getNewsBySlug);

/* UPDATE */
router.put("/update/:id", verifyAdminToken, uploadMixed, newsController.updateNews);

/* DELETE */
router.delete("/delete/:id", verifyAdminToken, newsController.deleteNews);

module.exports = router;