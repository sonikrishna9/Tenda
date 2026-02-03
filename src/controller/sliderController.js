const Slider = require("../model/SliderModel.js");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const cloudinary = require("../../config/cloudinary.js"); // ✅ ADD THIS


/* ---------------- GET SLIDER ---------------- */
exports.getSliderBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const slider = await Slider.findOne({ slug, isActive: true });

        if (!slider) {
            return res.status(404).json({
                success: false,
                message: "Slider not found",
            });
        }

        res.status(200).json({
            success: true,
            data: slider,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

/* ---------------- UPLOAD SLIDER ---------------- */
exports.uploadSliderImages = async (req, res) => {
    try {
        const { slug } = req.params;

        if (!req.files || !req.files.images) {
            return res.status(400).json({
                success: false,
                message: "No images uploaded",
            });
        }

        let slider = await Slider.findOne({ slug });

        if (!slider) {
            slider = await Slider.create({ slug });
        }

        for (const file of req.files.images) {
            const result = await uploadToCloudinary(
                file.buffer,
                `sliders/${slug}`,
                file.mimetype
            );

            slider.images.push({
                url: result.secure_url,
                public_id: result.public_id,
            });
        }

        await slider.save();

        res.status(200).json({
            success: true,
            message: "Slider images uploaded",
            data: slider,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Upload failed",
        });
    }
};

exports.deleteSliderBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const slider = await Slider.findOne({ slug });

        if (!slider) {
            return res.status(404).json({
                success: false,
                message: "Slider not found",
            });
        }

        // 🔥 Delete all images from Cloudinary
        for (const image of slider.images) {
            if (image.public_id) {
                await cloudinary.uploader.destroy(image.public_id);
            }
        }

        // 🔥 Delete slider document
        await Slider.deleteOne({ slug });

        res.status(200).json({
            success: true,
            message: `Slider '${slug}' deleted successfully`,
        });
    } catch (error) {
        console.error("Delete slider error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete slider",
        });
    }
};

exports.updateSliderImages = async (req, res) => {
    try {
        const { slug } = req.params;

        if (!req.files || !req.files.images) {
            return res.status(400).json({
                success: false,
                message: "No new images uploaded",
            });
        }

        const slider = await Slider.findOne({ slug });

        if (!slider) {
            return res.status(404).json({
                success: false,
                message: "Slider not found",
            });
        }

        /* 🔥 STEP 1: Delete old images from Cloudinary */
        for (const image of slider.images) {
            if (image.public_id) {
                await cloudinary.uploader.destroy(image.public_id);
            }
        }

        /* 🔥 STEP 2: Clear old images from DB */
        slider.images = [];

        /* 🔥 STEP 3: Upload new images */
        let order = 0;

        for (const file of req.files.images) {
            const result = await uploadToCloudinary(
                file.buffer,
                `sliders/${slug}`,
                file.mimetype
            );

            slider.images.push({
                url: result.secure_url,
                public_id: result.public_id,
                alt: "",
                order: order++,
            });
        }

        await slider.save();

        res.status(200).json({
            success: true,
            message: "Slider images updated successfully",
            data: slider,
        });
    } catch (error) {
        console.error("Update slider error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update slider images",
        });
    }
};

exports.getAllSliders = async (req, res) => {
  try {
    const sliders = await Slider.find({})
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      count: sliders.length,
      data: sliders,
    });
  } catch (error) {
    console.error("Get all sliders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sliders",
    });
  }
};

