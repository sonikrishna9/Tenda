const mongoose = require("mongoose");

const subCategoryBannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    parentCategory: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    subCategory: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    bannerImage: {
      url: { type: String, required: true },
      public_id: { type: String, default: null },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    slugParent: {
      type: String,
      required: true,
      index: true,
    },
    slugSub: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

subCategoryBannerSchema.index(
  { slugParent: 1, slugSub: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "SubCategoryBanner",
  subCategoryBannerSchema
);