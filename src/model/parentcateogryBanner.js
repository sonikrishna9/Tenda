const mongoose = require("mongoose");

const ParentCategoryBannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    subtitle: {
      type: String,
      trim: true
    },

    parentCategory: {
      type: String,
      required: true,
      trim: true
    },

    slugParent: {
      type: String,
      required: true,
      unique: true
    },

    description: {
      type: String,
      default: ""
    },

    bannerImage: {
      url: {
        type: String,
        required: true
      },
      public_id: {
        type: String,
        required: true
      }
    },

    isActive: {
      type: Boolean,
      default: true
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "ParentCategoryBanner",
  ParentCategoryBannerSchema
);