const Blog = require("../model/blogmodel");
const cloudinary = require("../../config/cloudinary");
const slugify = require("../utils/slugify.js");


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

        /* ---------- BASIC VALIDATION ---------- */
        if (!title || !slug || !excerpt || !content || !category || !author) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing",
            });
        }

        /* ---------- FEATURED IMAGE ---------- */
        if (!req.files?.featurePictures?.length) {
            return res.status(400).json({
                success: false,
                message: "Featured image is required",
            });
        }

        const featuredFile = req.files.featurePictures[0];

        const featuredUpload = await cloudinary.uploader.upload(
            `data:${featuredFile.mimetype};base64,${featuredFile.buffer.toString("base64")}`,
            {
                folder: "blogs/featured",
                resource_type: "image",
            }
        );

        const featuredImage = {
            url: featuredUpload.secure_url,
            public_id: featuredUpload.public_id,
        };

        /* ---------- GALLERY IMAGES ---------- */
        let gallery = [];

        if (req.files?.images?.length) {
            for (const file of req.files.images) {
                const upload = await cloudinary.uploader.upload(
                    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
                    {
                        folder: "blogs/gallery",
                        resource_type: "image",
                    }
                );

                gallery.push({
                    url: upload.secure_url,
                    public_id: upload.public_id,
                });
            }
        }

        /* ---------- CREATE BLOG ---------- */
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

        return res.status(201).json({
            success: true,
            message: "Blog created successfully",
            blog,
        });
    } catch (error) {
        console.error("Create Blog Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create blog",
            error: error.message,
        });
    }
};


exports.getAllBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, tag, search } = req.query;

        const query = {}; // 👈 IMPORTANT CHANGE

        if (category) query.category = category;
        if (tag) query.tags = { $in: [tag] };

        if (search) {
            query.$text = { $search: search };
        }

        const blogs = await Blog.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Blog.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: blogs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch blogs",
            error: error.message,
        });
    }
};



exports.getBlogBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const blog = await Blog.findOne({
            slug,
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
            error: error.message,
        });
    }
};

exports.updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { removeFeaturedImage } = req.body;

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        /* ---------- TEXT UPDATE ---------- */
        if (req.body.title) {
            blog.title = req.body.title;
            blog.slug = slugify(req.body.title, {
                lower: true,
                strict: true,
            });
        }

        if (req.body.excerpt) blog.excerpt = req.body.excerpt;
        if (req.body.content) blog.content = req.body.content;
        if (req.body.category) blog.category = req.body.category;
        if (req.body.tags) blog.tags = JSON.parse(req.body.tags);
        if (req.body.status) blog.status = req.body.status;

        if (req.body.status === "published" && !blog.publishedAt) {
            blog.publishedAt = new Date();
        }

        /* ---------- REMOVE FEATURED IMAGE ---------- */
        if (removeFeaturedImage === "true" && blog.featuredImage?.public_id) {
            await cloudinary.uploader.destroy(blog.featuredImage.public_id);
            blog.featuredImage = undefined;
        }

        /* ---------- REPLACE FEATURED IMAGE ---------- */
        if (req.files?.featurePictures?.length) {
            const file = req.files.featurePictures[0];

            if (blog.featuredImage?.public_id) {
                await cloudinary.uploader.destroy(blog.featuredImage.public_id);
            }

            const upload = await cloudinary.uploader.upload(
                `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
                {
                    folder: "blogs/featured",
                }
            );

            blog.featuredImage = {
                url: upload.secure_url,
                public_id: upload.public_id,
            };
        }

        await blog.save();

        return res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            blog,
        });

    } catch (error) {
        console.error("UPDATE BLOG ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};




exports.deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findByIdAndDelete(id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Blog deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete blog",
            error: error.message,
        });
    }
};

