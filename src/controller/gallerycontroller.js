const Gallery = require("../model/gallerymodel");
const cloudinary = require("../../config/cloudinary");
const slugify = require("../utils/slugify");

/* ================= CREATE GALLERY ================= */

exports.createGallery = async (req, res) => {
    try {
        const { title, description, eventDate, location } = req.body;

        if (!title || !description || !eventDate || !location) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing",
            });
        }

        if (!req.files?.images?.length) {
            return res.status(400).json({
                success: false,
                message: "Gallery images required",
            });
        }

        const slug = slugify(title, { lower: true, strict: true });

        /* ---------- IMAGE UPLOAD ---------- */

        const images = [];

        for (const file of req.files.images) {
            const upload = await cloudinary.uploader.upload(
                `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
                {
                    folder: "gallery",
                }
            );

            images.push({
                url: upload.secure_url,
                public_id: upload.public_id,
            });
        }

        const gallery = await Gallery.create({
            title,
            slug,
            description,
            eventDate,
            location,
            images,
        });

        res.status(201).json({
            success: true,
            message: "Gallery created successfully",
            gallery,
        });
    } catch (error) {
        console.error("Create Gallery Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create gallery",
            error: error.message,
        });
    }
};

exports.getAllGalleries = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;

        const query = {};

        if (search) {
            query.title = { $regex: search, $options: "i" };
        }

        const galleries = await Gallery.find(query)
            .sort({ eventDate: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Gallery.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: galleries,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch galleries",
            error: error.message,
        });
    }
};

exports.getGalleryBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const gallery = await Gallery.findOne({ slug });

        if (!gallery) {
            return res.status(404).json({
                success: false,
                message: "Gallery not found",
            });
        }

        res.status(200).json({
            success: true,
            data: gallery,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch gallery",
            error: error.message,
        });
    }
};


exports.updateGallery = async (req, res) => {
    try {
        const { id } = req.params;
        const { removeImages } = req.body; // array of public_ids

        const gallery = await Gallery.findById(id);

        if (!gallery) {
            return res.status(404).json({
                success: false,
                message: "Gallery not found",
            });
        }

        /* ---------- TEXT UPDATE ---------- */

        if (req.body.title) {
            gallery.title = req.body.title;
            gallery.slug = slugify(req.body.title, {
                lower: true,
                strict: true,
            });
        }

        if (req.body.description) gallery.description = req.body.description;
        if (req.body.eventDate) gallery.eventDate = req.body.eventDate;
        if (req.body.location) gallery.location = req.body.location;

        /* ---------- REMOVE SELECTED IMAGES ---------- */

        if (removeImages) {
            const imagesToRemove = JSON.parse(removeImages);

            for (const public_id of imagesToRemove) {
                await cloudinary.uploader.destroy(public_id);
            }

            gallery.images = gallery.images.filter(
                (img) => !imagesToRemove.includes(img.public_id)
            );
        }

        /* ---------- ADD NEW IMAGES ---------- */

        if (req.files?.images?.length) {
            for (const file of req.files.images) {
                const upload = await cloudinary.uploader.upload(
                    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
                    {
                        folder: "gallery",
                    }
                );

                gallery.images.push({
                    url: upload.secure_url,
                    public_id: upload.public_id,
                });
            }
        }

        await gallery.save();

        res.status(200).json({
            success: true,
            message: "Gallery updated successfully",
            gallery,
        });

    } catch (error) {
        console.error("Update Gallery Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update gallery",
            error: error.message,
        });
    }
};


exports.deleteGallery = async (req, res) => {
    try {
        const { id } = req.params;

        const gallery = await Gallery.findById(id);

        if (!gallery) {
            return res.status(404).json({
                success: false,
                message: "Gallery not found",
            });
        }

        /* ---------- DELETE IMAGES FROM CLOUDINARY ---------- */

        if (gallery.images?.length) {
            for (const img of gallery.images) {
                if (img.public_id) {
                    await cloudinary.uploader.destroy(img.public_id);
                }
            }
        }

        /* ---------- DELETE FROM DATABASE ---------- */

        await Gallery.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Gallery deleted successfully",
        });

    } catch (error) {
        console.error("Delete Gallery Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete gallery",
            error: error.message,
        });
    }
};


