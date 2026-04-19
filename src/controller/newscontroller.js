const News = require("../model/newsmodel.js");
const path = require("path");
const fs = require("fs");
const slugify = require("../utils/slugify.js");
const { buildUploadUrl } = require("../utils/uploadUrl");

/* ================= CREATE ================= */
exports.createNews = async (req, res) => {
  try {
    const { title, description, publishedDate, location, category, author } =
      req.body;

    if (!title || !description || !publishedDate || !location) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const slug = slugify(title, { lower: true, strict: true });

    let bannerImage = null;
    let images = [];

    /* ---------- BANNER IMAGE ---------- */
    if (req.files?.bannerImage?.length) {
      const file = req.files.bannerImage[0];

      bannerImage = {
        url: buildUploadUrl("products", "images", file.filename),
        public_id: file.filename,
      };
    }

    /* ---------- MULTIPLE IMAGES ---------- */
    if (req.files?.images?.length) {
      images = req.files.images.map((file) => ({
        url: buildUploadUrl("products", "images", file.filename),
        public_id: file.filename,
      }));
    }

    const news = await News.create({
      title,
      slug,
      description,
      bannerImage,
      images,
      publishedDate,
      location,
      category,
      author,
    });

    res.status(201).json({
      success: true,
      message: "News created successfully",
      news,
    });

  } catch (error) {
    console.error("Create News Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create news",
    });
  }
};

/* ================= GET ALL ================= */
exports.getAllNews = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const news = await News.find(query)
      .sort({ publishedDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await News.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: news,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch news",
    });
  }
};

/* ================= GET SINGLE ================= */
exports.getNewsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const news = await News.findOne({ slug });

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    res.status(200).json({
      success: true,
      data: news,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch news",
    });
  }
};

/* ================= UPDATE ================= */
exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { removeImages } = req.body;

    const news = await News.findById(id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    /* TEXT UPDATE */
    if (req.body.title) {
      news.title = req.body.title;
      news.slug = slugify(req.body.title, {
        lower: true,
        strict: true,
      });
    }

    if (req.body.description) news.description = req.body.description;
    if (req.body.location) news.location = req.body.location;
    if (req.body.category) news.category = req.body.category;
    if (req.body.author) news.author = req.body.author;
    if (req.body.publishedDate) news.publishedDate = req.body.publishedDate;

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

      news.images = news.images.filter(
        (img) => !imagesToRemove.includes(img.public_id)
      );
    }

    /* ADD NEW IMAGES */
    if (req.files?.images?.length) {
      for (const file of req.files.images) {
        news.images.push({
          url: buildUploadUrl("products", "images", file.filename),
          public_id: file.filename,
        });
      }
    }

    /* UPDATE BANNER */
    if (req.files?.bannerImage?.length) {
      if (news.bannerImage?.public_id) {
        const oldPath = path.join(
          __dirname,
          "../../public/uploads/products/images/",
          news.bannerImage.public_id
        );

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      const file = req.files.bannerImage[0];

      news.bannerImage = {
        url: buildUploadUrl("products", "images", file.filename),
        public_id: file.filename,
      };
    }

    await news.save();

    res.status(200).json({
      success: true,
      message: "News updated successfully",
      news,
    });

  } catch (error) {
    console.error("Update News Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update news",
    });
  }
};


/* ================= DELETE ================= */
exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findById(id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    /* DELETE BANNER */
    if (news.bannerImage?.public_id) {
      const filePath = path.join(
        __dirname,
        "../../public/uploads/products/images/",
        news.bannerImage.public_id
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    /* DELETE IMAGES */
    for (const img of news.images) {
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

    await news.deleteOne();

    res.status(200).json({
      success: true,
      message: "News deleted successfully",
    });

  } catch (error) {
    console.error("Delete News Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete news",
    });
  }
};
