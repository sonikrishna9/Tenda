const mongoose = require("mongoose");

const seoSchema = new mongoose.Schema(
  {
    pageType: {
      type: String,
      enum: ["static", "product", "singleProduct"],
      default: "static",
      trim: true,
    },
    entityType: {
      type: String,
      enum: ["page", "parentCategory", "subCategory", "productDetail"],
      default: "page",
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    pageLabel: {
      type: String,
      default: "",
      trim: true,
    },
    parentCategory: {
      type: String,
      default: "",
      trim: true,
    },
    subCategory: {
      type: String,
      default: "",
      trim: true,
    },
    productTitle: {
      type: String,
      default: "",
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

module.exports = mongoose.model("SEO", seoSchema);
