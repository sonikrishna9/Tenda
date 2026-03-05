const express = require("express");
const router = express.Router();

const newsController = require("../controller/newscontroller.js");
const { uploadMixed } = require("../middleware/uploadMiddleware.js");

/* CREATE */
router.post("/create", uploadMixed, newsController.createNews);

/* GET ALL */
router.get("/all", newsController.getAllNews);

/* GET BY SLUG */
router.get("/:slug", newsController.getNewsBySlug);

/* UPDATE */
router.put("/update/:id", uploadMixed, newsController.updateNews);

/* DELETE */
router.delete("/delete/:id", newsController.deleteNews);

module.exports = router;