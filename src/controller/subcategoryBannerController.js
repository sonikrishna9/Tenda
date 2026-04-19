const SubCategoryBanner = require("../model/SubCategoryBanner.js");
const path = require("path");
const fs = require("fs");
const { buildUploadUrl } = require("../utils/uploadUrl");

/* ================= SLUGIFY ================= */
const slugify = (s = "") =>
  s
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

/* ================= GET ================= */
exports.getSubCategoryBanner = async (req, res) => {
  try {
    const { parentCategory, subCategory } = req.params;

    const banner = await SubCategoryBanner.findOne({
      slugParent: slugify(parentCategory),
      slugSub: slugify(subCategory),
      isActive: true,
    });

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.json({ success: true, banner });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= CREATE ================= */
exports.createSubCategoryBanner = async (req, res) => {
  try {
    const { title, subtitle, parentCategory, subCategory, description } = req.body;

    if (!req.files?.bannerImage?.[0]) {
      return res.status(400).json({
        success: false,
        message: "Banner image required",
      });
    }

    const slugParent = slugify(parentCategory);
    const slugSub = slugify(subCategory);

    const existing = await SubCategoryBanner.findOne({ slugParent, slugSub });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Banner already exists",
      });
    }

    const file = req.files.bannerImage[0];

    const banner = await SubCategoryBanner.create({
      title,
      subtitle,
      parentCategory,
      subCategory,
      slugParent,
      slugSub,
      description,
      bannerImage: {
        url: buildUploadUrl("products", "images", file.filename),
        public_id: file.filename,
      },
    });

    res.status(201).json({
      success: true,
      message: "Banner created",
      banner,
    });

  } catch (error) {
    console.error("CREATE BANNER ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= GET ALL ================= */
exports.getAllSubCategoryBanners = async (req, res) => {
  try {
    const banners = await SubCategoryBanner.find().sort({
      sortOrder: 1,
      createdAt: -1,
    });

    res.json({
      success: true,
      banners,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= UPDATE ================= */
exports.updateSubCategoryBanner = async (req, res) => {
  try {
    const banner = await SubCategoryBanner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    let updatedImage = banner.bannerImage;

    /* 🔥 NEW IMAGE */
    if (req.files?.bannerImage?.[0]) {
      const file = req.files.bannerImage[0];

      // delete old image
      if (banner.bannerImage?.public_id) {
        const oldPath = path.join(
          __dirname,
          "../../public/uploads/products/images/",
          banner.bannerImage.public_id
        );

        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      updatedImage = {
        url: buildUploadUrl("products", "images", file.filename),
        public_id: file.filename,
      };
    }

    const updated = await SubCategoryBanner.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title ?? banner.title,
        subtitle: req.body.subtitle ?? banner.subtitle,
        description: req.body.description ?? banner.description,
        bannerImage: updatedImage,
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Banner updated",
      banner: updated,
    });

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= DELETE ================= */
exports.deleteSubCategoryBanner = async (req, res) => {
  try {
    const banner = await SubCategoryBanner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // 🔥 delete local image
    if (banner.bannerImage?.public_id) {
      const filePath = path.join(
        __dirname,
        "../../public/uploads/products/images/",
        banner.bannerImage.public_id
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await banner.deleteOne();

    res.json({
      success: true,
      message: "Banner deleted successfully",
    });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
