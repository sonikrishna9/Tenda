// models/seo.model.js

const mongoose = require("mongoose");

const seoSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    metaTitle: {
      type: String,
      default: "",
    },
    metaDescription: {
      type: String,
      default: "",
    },
    metaKeywords: {
      type: [String],
      default: [],
    },
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
  },
  { timestamps: true }
);

// index for fast lookup
seoSchema.index({ slug: 1 });

module.exports = mongoose.model("SEO", seoSchema);