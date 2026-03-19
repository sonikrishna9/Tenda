// controllers/video.controller.js

const Video = require("../model/Video.js");

// CREATE / UPDATE
const upsertVideos = async (req, res) => {
  try {
    const { slug, videos } = req.body;

    if (!slug || !videos || !Array.isArray(videos)) {
      return res.status(400).json({
        success: false,
        message: "Slug and videos array required",
      });
    }

    if (videos.length > 12) {
      return res.status(400).json({
        success: false,
        message: "Max 12 videos allowed",
      });
    }

    const data = await Video.findOneAndUpdate(
      { slug },
      { videos },
      { new: true, upsert: true }
    );

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

// GET BY SLUG
const getVideosBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

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

// GET ALL
const getAllVideos = async (req, res) => {
  try {
    const data = await Video.find();

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

// DELETE
const deleteBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

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

// ✅ EXPORT (IMPORTANT)
module.exports = {
  upsertVideos,
  getVideosBySlug,
  getAllVideos,
  deleteBySlug,
};