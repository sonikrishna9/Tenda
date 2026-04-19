const Blog = require("../model/blogmodel");
const slugify = require("../utils/slugify.js");
const path = require("path");
const fs = require("fs");
const { buildUploadUrl } = require("../utils/uploadUrl");

/* ================= CREATE BLOG ================= */
exports.createBlog = async (req, res) => {
    try {
        const {
            title,
            slug,
            excerpt,
            content,
            category,
            tags,
            status,
            author,
        } = req.body;

        if (!title || !slug || !excerpt || !content || !category || !author) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing",
            });
        }

        console.log("FILES:", req.files);
        console.log("FEATURE FILE:", req.files?.featurePictures);

        /* ---------- FEATURED IMAGE ---------- */
        const featuredFile = req.files?.featurePictures?.[0];

        if (!featuredFile) {
            return res.status(400).json({
                success: false,
                message: "Featured image is required",
            });
        }

        const featuredImage = {
            url: buildUploadUrl("products", "feature-pictures", featuredFile.filename),
            public_id: featuredFile.filename,
        };

        /* ---------- GALLERY ---------- */
        let gallery = [];

        if (req.files?.images?.length) {
            gallery = req.files.images.map((file) => ({
                url: buildUploadUrl("products", "images", file.filename),
                public_id: file.filename,
            }));
        }

        /* ---------- CREATE ---------- */
        const blog = await Blog.create({
            title,
            slug,
            excerpt,
            content,
            category,
            tags: tags ? JSON.parse(tags) : [],
            author: { name: author },
            status: status || "draft",
            featuredImage,
            gallery,
            publishedAt: status === "published" ? new Date() : null,
        });

        res.status(201).json({
            success: true,
            message: "Blog created successfully",
            blog,
        });

    } catch (error) {
        console.error("CREATE BLOG ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create blog",
            error: error.message,
        });
    }
};

/* ================= GET ALL ================= */
exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: blogs,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch blogs",
        });
    }
};

/* ================= GET BY SLUG ================= */
exports.getBlogBySlug = async (req, res) => {
    try {
        const blog = await Blog.findOne({
            slug: req.params.slug,
            status: "published",
        });

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        res.status(200).json({
            success: true,
            data: blog,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch blog",
        });
    }
};

exports.updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        /* TEXT UPDATE */
        if (req.body.title) {
            blog.title = req.body.title;
            blog.slug = slugify(req.body.title);
        }

        if (req.body.excerpt) blog.excerpt = req.body.excerpt;
        if (req.body.content) blog.content = req.body.content;
        if (req.body.category) blog.category = req.body.category;
        if (req.body.tags) blog.tags = JSON.parse(req.body.tags);
        if (req.body.status) blog.status = req.body.status;

        if (req.body.status === "published" && !blog.publishedAt) {
            blog.publishedAt = new Date();
        }

        /* FEATURE IMAGE UPDATE */
        const file = req.files?.featurePictures?.[0];

        if (file) {
            // delete old
            if (blog.featuredImage?.public_id) {
                const oldPath = path.join(
                    __dirname,
                    "../../public/uploads/products/images/",
                    blog.featuredImage.public_id
                );

                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }

            blog.featuredImage = {
                url: buildUploadUrl("products", "feature-pictures", file.filename),
                public_id: file.filename,
            };
        }

        await blog.save();

        res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            blog,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Update failed",
        });
    }
};

/* ================= DELETE ================= */
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        /* DELETE FEATURE IMAGE */
        if (blog.featuredImage?.public_id) {
            const filePath = path.join(
                __dirname,
                "../../public/uploads/products/images/",
                blog.featuredImage.public_id
            );

            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        /* DELETE GALLERY */
        if (blog.gallery?.length) {
            blog.gallery.forEach((img) => {
                const filePath = path.join(
                    __dirname,
                    "../../public/uploads/products/images/",
                    img.public_id
                );

                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            });
        }

        await Blog.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Blog deleted successfully",
        });

    } catch (error) {
        console.error("DELETE BLOG ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Delete failed",
        });
    }
};
