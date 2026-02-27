const ParentCatgoryBanner = require("../model/parentcateogryBanner.js");
const cloudinary = require("cloudinary").v2;
const uploadBuffer = require("../utils/cloudinaryUpload.js");
const deleteFromCloudinary = require("../utils/cloudinaryDelete.js");


// SAME SLUGIFY AS FRONTEND
const slugify = (s = "") =>
    s
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-");


/* ================= GET BANNER BY SLUG ================= */
exports.getParentCatgoryBanner = async (req, res) => {
    try {
        const { parentCategory } = req.params;

        const parentSlug = slugify(parentCategory);

        const banner = await ParentCatgoryBanner.findOne({
            slugParent: parentSlug,
            isActive: true
        });

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        return res.status(200).json({
            success: true,
            banner
        });

    } catch (error) {
        console.error("❌ getParentCatgoryBanner error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


exports.createParentCatgoryBanner = async (req, res) => {
    try {
        const { title, subtitle, parentCategory, description } = req.body;

        if (!parentCategory) {
            return res.status(400).json({
                success: false,
                message: "Parent category required"
            });
        }

        if (!req.files?.bannerImage?.[0]) {
            return res.status(400).json({
                success: false,
                message: "Banner image required"
            });
        }

        const slugParent = slugify(parentCategory);

        const existing = await ParentCatgoryBanner.findOne({ slugParent });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Banner already exists for this parent category"
            });
        }

        const file = req.files.bannerImage[0];
        const uploaded = await uploadBuffer(file.buffer, "ParentCatgoryBanner");

        const banner = await ParentCatgoryBanner.create({
            title,
            subtitle,
            parentCategory,
            slugParent,
            description,
            bannerImage: {
                url: uploaded.secure_url,
                public_id: uploaded.public_id
            }
        });

        res.status(201).json({
            success: true,
            message: "Banner created",
            banner
        });

    } catch (error) {
        console.error("❌ createParentCatgoryBanner:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


exports.getAllParentCatgoryBanners = async (req, res) => {
    try {
        const banners = await ParentCatgoryBanner.find().sort({ sortOrder: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: banners.length,
            banners
        });

    } catch (error) {
        console.error("❌ getAllParentCatgoryBanners:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


exports.updateParentCatgoryBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const banner = await ParentCatgoryBanner.findById(id);
        if (!banner) {
            return res.status(404).json({ success: false, message: "Banner not found" });
        }

        let updatedImage = banner.bannerImage;

        // 🔥 If new image uploaded → delete old first
        if (req.files?.bannerImage?.[0]) {

            if (banner.bannerImage?.public_id) {
                await deleteFromCloudinary(banner.bannerImage.public_id);
            }

            const file = req.files.bannerImage[0];
            const uploaded = await uploadBuffer(file.buffer, "ParentCatgoryBanner");

            updatedImage = {
                url: uploaded.secure_url,
                public_id: uploaded.public_id
            };
        }

        const updatedParentCategory = req.body.parentCategory ?? banner.parentCategory;
        const updatedSlug = slugify(updatedParentCategory);

        const updated = await ParentCatgoryBanner.findByIdAndUpdate(
            id,
            {
                title: req.body.title ?? banner.title,
                subtitle: req.body.subtitle ?? banner.subtitle,
                parentCategory: updatedParentCategory,
                slugParent: updatedSlug,
                description: req.body.description ?? banner.description,
                bannerImage: updatedImage
            },
            { new: true }
        );

        res.json({
            success: true,
            message: "Banner updated",
            banner: updated
        });

    } catch (error) {
        console.error("❌ updateParentCatgoryBanner:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


exports.deleteParentCatgoryBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const banner = await ParentCatgoryBanner.findById(id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        // 🔥 DELETE CLOUDINARY IMAGE FIRST
        if (banner.bannerImage?.public_id) {
            await deleteFromCloudinary(banner.bannerImage.public_id);
        }

        await banner.deleteOne();

        res.json({
            success: true,
            message: "Banner deleted successfully"
        });

    } catch (error) {
        console.error("❌ deleteParentCatgoryBanner:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};