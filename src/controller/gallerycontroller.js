const Gallery = require("../model/gallerymodel");
const path = require("path");
const fs = require("fs");
const slugify = require("../utils/slugify");

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

/* ================= CREATE ================= */
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

    const images = req.files.images.map((file) => ({
      url: `${BASE_URL}/uploads/products/images/${file.filename}`,
      public_id: file.filename,
    }));

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
    });
  }
};

/* ================= GET ALL ================= */
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
    });
  }
};


/* ================= GET SINGLE ================= */
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
    });
  }
};

/* ================= UPDATE ================= */
exports.updateGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const { removeImages } = req.body;

    const gallery = await Gallery.findById(id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery not found",
      });
    }

    /* TEXT UPDATE */
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

    /* REMOVE IMAGES */
    if (removeImages) {
      const imagesToRemove = JSON.parse(removeImages);

      for (const public_id of imagesToRemove) {
        const filePath = path.join(
          __dirname,
          "../../public/uploads/products/images/",
          public_id
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      gallery.images = gallery.images.filter(
        (img) => !imagesToRemove.includes(img.public_id)
      );
    }

    /* ADD NEW IMAGES */
    if (req.files?.images?.length) {
      for (const file of req.files.images) {
        gallery.images.push({
          url: `${BASE_URL}/uploads/products/images/${file.filename}`,
          public_id: file.filename,
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
    });
  }
};


/* ================= DELETE ================= */
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

    /* DELETE LOCAL IMAGES */
    for (const img of gallery.images) {
      if (img.public_id) {
        const filePath = path.join(
          __dirname,
          "../../public/uploads/products/images/",
          img.public_id
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await gallery.deleteOne();

    res.status(200).json({
      success: true,
      message: "Gallery deleted successfully",
    });

  } catch (error) {
    console.error("Delete Gallery Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete gallery",
    });
  }
};