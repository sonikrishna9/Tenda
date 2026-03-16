const express = require("express");
const {
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogBySlug,
  getAllBlogs,
} = require("../../controller/blogcontroller");

const { uploadMixed } = require("../../middleware/uploadMiddleware");
const { verifyAdminToken } = require("../../middleware/verifyAdminToken.js");

const router = express.Router();

/* CREATE */
router.post("/create",verifyAdminToken, uploadMixed, createBlog);

/* READ */
router.get("/get-all", verifyAdminToken,getAllBlogs);
router.get("/single/:slug", verifyAdminToken,getBlogBySlug);

/* UPDATE */
router.put("/update/:id", verifyAdminToken,uploadMixed, updateBlog);

/* DELETE */
router.delete("/delete/:id", verifyAdminToken,deleteBlog);

module.exports = router;
