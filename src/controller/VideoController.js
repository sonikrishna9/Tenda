// controllers/video.controller.js

const Video = require("../model/Video.js");

/* ================= CREATE / UPDATE ================= */
const upsertVideos = async (req, res) => {
  try {
    const { slug, videos } = req.body;

    // ✅ VALIDATIONS
    if (!slug || !Array.isArray(videos)) {
      return res.status(400).json({
        success: false,
        message: "Slug and videos array required",
      });
    }

    const cleanVideos = videos
      .map((v) => v.trim())
      .filter((v) => v !== "");

    if (cleanVideos.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one video required",
      });
    }

    if (cleanVideos.length > 12) {
      return res.status(400).json({
        success: false,
        message: "Max 12 videos allowed",
      });
    }

    // ✅ REMOVE DUPLICATES
    const uniqueVideos = [...new Set(cleanVideos)];

    // ✅ UPSERT WITH SAFE UPDATE
    const data = await Video.findOneAndUpdate(
      { slug },
      {
        $set: {
          slug,
          videos: uniqueVideos,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    // ✅ DEBUG (optional remove later)
    console.log("Saved Data:", data);

    res.status(200).json({
      success: true,
      message: "Videos saved successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= GET BY SLUG ================= */
const getVideosBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug is required",
      });
    }

    const data = await Video.findOne({ slug });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No videos found",
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= GET ALL ================= */
const getAllVideos = async (req, res) => {
  try {
    const data = await Video.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= DELETE ================= */
const deleteBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug is required",
      });
    }

    const data = await Video.findOneAndDelete({ slug });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  upsertVideos,
  getVideosBySlug,
  getAllVideos,
  deleteBySlug,
};