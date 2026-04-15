const Slider = require("../model/SliderModel.js");
const path = require("path");
const fs = require("fs");

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

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

    let order = slider.images.length;

    for (const file of req.files.images) {
      slider.images.push({
        url: `${BASE_URL}/uploads/products/images/${file.filename}`,
        public_id: file.filename,
        alt: "",
        order: order++,
      });
    }

    await slider.save();

    res.status(200).json({
      success: true,
      message: "Slider images uploaded",
      data: slider,
    });

  } catch (error) {
    console.error("UPLOAD SLIDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
};

/* ---------------- DELETE SLIDER ---------------- */
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

    // 🔥 delete all images locally
    for (const image of slider.images) {
      if (image.public_id) {
        const filePath = path.join(
          __dirname,
          "../../public/uploads/products/images/",
          image.public_id
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await Slider.deleteOne({ slug });

    res.status(200).json({
      success: true,
      message: `Slider '${slug}' deleted successfully`,
    });

  } catch (error) {
    console.error("DELETE SLIDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete slider",
    });
  }
};

/* ---------------- UPDATE SLIDER ---------------- */
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

    /* 🔥 STEP 1: delete old images */
    for (const image of slider.images) {
      if (image.public_id) {
        const filePath = path.join(
          __dirname,
          "../../public/uploads/products/images/",
          image.public_id
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    /* 🔥 STEP 2: clear DB */
    slider.images = [];

    /* 🔥 STEP 3: add new images */
    let order = 0;

    for (const file of req.files.images) {
      slider.images.push({
        url: `${BASE_URL}/uploads/products/images/${file.filename}`,
        public_id: file.filename,
        alt: "",
        order: order++,
      });
    }

    await slider.save();

    res.status(200).json({
      success: true,
      message: "Slider updated successfully",
      data: slider,
    });

  } catch (error) {
    console.error("UPDATE SLIDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update slider",
    });
  }
};

/* ---------------- GET ALL ---------------- */
exports.getAllSliders = async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sliders.length,
      data: sliders,
    });

  } catch (error) {
    console.error("GET ALL SLIDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sliders",
    });
  }
};