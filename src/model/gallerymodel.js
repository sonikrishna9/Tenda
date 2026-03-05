const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: String,
    public_id: String,
  },
  { _id: false }
);

const gallerySchema = new mongoose.Schema(
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

    eventDate: {
      type: Date,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    images: [imageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gallery", gallerySchema);