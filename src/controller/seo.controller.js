// controllers/seo.controller.js

const SEO = require("../model/seo.model.js");

// ➤ CREATE
const createSEO = async (req, res) => {
  try {
    const { slug } = req.body;

    // check duplicate slug
    const exists = await SEO.findOne({ slug });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "SEO already exists for this slug",
      });
    }

    const seo = new SEO(req.body);
    await seo.save();

    return res.json({
      success: true,
      message: "SEO created successfully",
      data: seo,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ➤ GET ALL
const getAllSEO = async (req, res) => {
  try {
    const list = await SEO.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: list,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ➤ GET BY SLUG
const getSEOBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const seo = await SEO.findOne({ slug });

    return res.json({
      success: true,
      data: seo || {},
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ➤ UPDATE BY ID
const updateSEO = async (req, res) => {
  try {
    const { id } = req.params;

    const seo = await SEO.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!seo) {
      return res.status(404).json({
        success: false,
        message: "SEO not found",
      });
    }

    return res.json({
      success: true,
      message: "SEO updated successfully",
      data: seo,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ➤ DELETE
const deleteSEO = async (req, res) => {
  try {
    const { id } = req.params;

    const seo = await SEO.findByIdAndDelete(id);

    if (!seo) {
      return res.status(404).json({
        success: false,
        message: "SEO not found",
      });
    }

    return res.json({
      success: true,
      message: "SEO deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSEO,
  getAllSEO,
  getSEOBySlug,
  updateSEO,
  deleteSEO,
};