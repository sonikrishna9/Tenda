const Slider = require("../model/SliderModel.js");
const path = require("path");
const fs = require("fs");
const { buildUploadUrl } = require("../utils/uploadUrl");

const getImageFilePath = (publicId) =>
  path.join(__dirname, "../../public/uploads/products/images/", publicId);

const deleteLocalImage = (publicId) => {
  if (!publicId) return;

  const filePath = getImageFilePath(publicId);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const sortImagesByOrder = (images = []) =>
  [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const serializeSlider = (slider) => {
  const data = slider?.toObject ? slider.toObject() : slider;

  return {
    ...data,
    images: sortImagesByOrder(data?.images || []),
  };
};

const parseJsonArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  return [];
};

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
      data: serializeSlider(slider),
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
        url: buildUploadUrl("products", "images", file.filename),
        public_id: file.filename,
        alt: "",
        order: order++,
      });
    }

    await slider.save();

    res.status(200).json({
      success: true,
      message: "Slider images uploaded",
      data: serializeSlider(slider),
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

    for (const image of slider.images) {
      deleteLocalImage(image.public_id);
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

    const slider = await Slider.findOne({ slug });

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Slider not found",
      });
    }

    const uploadedFiles = req.files?.images || [];
    const hasExplicitImageOrder = typeof req.body.imageOrder !== "undefined";
    const imageOrder = parseJsonArray(req.body.imageOrder);
    const newImageIds = Array.isArray(req.body.newImageIds)
      ? req.body.newImageIds
      : req.body.newImageIds
        ? [req.body.newImageIds]
        : [];

    const existingImages = sortImagesByOrder(slider.images || []);
    const existingImageMap = new Map(
      existingImages.map((image) => [`existing:${image.public_id}`, image])
    );

    const uploadedImageMap = new Map();
    uploadedFiles.forEach((file, index) => {
      const token = `new:${newImageIds[index] || `upload-${index}`}`;

      uploadedImageMap.set(token, {
        url: buildUploadUrl("products", "images", file.filename),
        public_id: file.filename,
        alt: "",
      });
    });

    const normalizedOrder = hasExplicitImageOrder
      ? imageOrder
      : [
          ...existingImages.map((image) => `existing:${image.public_id}`),
          ...[...uploadedImageMap.keys()],
        ];

    const nextImages = [];
    const keptExistingIds = new Set();
    const usedUploadTokens = new Set();

    normalizedOrder.forEach((token) => {
      if (existingImageMap.has(token)) {
        const existingImage = existingImageMap.get(token);

        keptExistingIds.add(existingImage.public_id);
        nextImages.push({
          ...(existingImage.toObject?.() ?? existingImage),
          order: nextImages.length,
        });
        return;
      }

      if (uploadedImageMap.has(token)) {
        const uploadedImage = uploadedImageMap.get(token);

        usedUploadTokens.add(token);
        nextImages.push({
          ...uploadedImage,
          order: nextImages.length,
        });
      }
    });

    existingImages.forEach((image) => {
      if (!keptExistingIds.has(image.public_id)) {
        deleteLocalImage(image.public_id);
      }
    });

    [...uploadedImageMap.entries()].forEach(([token, image]) => {
      if (!usedUploadTokens.has(token)) {
        nextImages.push({
          ...image,
          order: nextImages.length,
        });
      }
    });

    slider.images = nextImages;
    await slider.save();

    res.status(200).json({
      success: true,
      message: "Slider updated successfully",
      data: serializeSlider(slider),
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
      data: sliders.map(serializeSlider),
    });
  } catch (error) {
    console.error("GET ALL SLIDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sliders",
    });
  }
};
