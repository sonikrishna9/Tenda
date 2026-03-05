const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: String,
    public_id: String,
  },
  { _id: false }
);

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
      required: true,
    },

    bannerImage: imageSchema,

    images: [imageSchema],

    publishedDate: {
      type: Date,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      default: "General",
    },

    author: {
      type: String,
      default: "Admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("News", newsSchema);