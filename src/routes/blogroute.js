const express = require("express");
const {
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogBySlug,
  getAllBlogs,
} = require("../controller/blogcontroller");

const { uploadMixed } = require("../middleware/uploadMiddleware");

const router = express.Router();

/* CREATE */
router.post("/create", uploadMixed, createBlog);

/* READ */
router.get("/get-all", getAllBlogs);
router.get("/single/:slug", getBlogBySlug);

/* UPDATE */
router.put("/update/:id", uploadMixed, updateBlog);

/* DELETE */
router.delete("/delete/:id", deleteBlog);

module.exports = router;
