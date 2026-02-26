const SubCategoryBanner = require("../model/SubCategoryBanner.js");
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
exports.getSubCategoryBanner = async (req, res) => {
    try {
        const { parentCategory, subCategory } = req.params;

        const parentSlug = slugify(parentCategory);
        const subSlug = slugify(subCategory);

        // Find banner where stored slugs match
        const banner = await SubCategoryBanner.findOne({
            slugParent: parentSlug,
            slugSub: subSlug,
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
        console.error("❌ getSubCategoryBanner error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


exports.createSubCategoryBanner = async (req, res) => {
    try {
        const { title, subtitle, parentCategory, subCategory, description } = req.body;

        if (!parentCategory || !subCategory) {
            return res.status(400).json({ success: false, message: "Parent & Subcategory required" });
        }

        if (!req.files?.bannerImage?.[0]) {
            return res.status(400).json({ success: false, message: "Banner image required" });
        }

        const slugParent = slugify(parentCategory);
        const slugSub = slugify(subCategory);

        const existing = await SubCategoryBanner.findOne({ slugParent, slugSub });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Banner already exists"
            });
        }

        const file = req.files.bannerImage[0];

        const uploaded = await uploadBuffer(file.buffer, "subcategorybanner");

        const banner = await SubCategoryBanner.create({
            title,
            subtitle,
            parentCategory,
            subCategory,
            slugParent,
            slugSub,
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
        console.error("❌ createSubCategoryBanner:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


exports.getAllSubCategoryBanners = async (req, res) => {
    try {
        const banners = await SubCategoryBanner.find().sort({ sortOrder: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: banners.length,
            banners
        });

    } catch (error) {
        console.error("❌ getAllSubCategoryBanners:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


exports.updateSubCategoryBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const banner = await SubCategoryBanner.findById(id);
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
            const uploaded = await uploadBuffer(file.buffer, "subcategorybanner");

            updatedImage = {
                url: uploaded.secure_url,
                public_id: uploaded.public_id
            };
        }

        const updated = await SubCategoryBanner.findByIdAndUpdate(
            id,
            {
                title: req.body.title ?? banner.title,
                subtitle: req.body.subtitle ?? banner.subtitle,
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
        console.error("❌ updateSubCategoryBanner:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


exports.deleteSubCategoryBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await SubCategoryBanner.findById(id);

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
    console.error("❌ deleteSubCategoryBanner:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};