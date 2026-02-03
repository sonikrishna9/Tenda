const mongoose = require("mongoose");

const sliderImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  public_id: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: "",
  },
  order: {
    type: Number,
    default: 0,
  },
});

const sliderSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true, // home, dealer, si-sp-partner
      lowercase: true,
      trim: true,
    },
    title: {
      type: String,
    },
    images: [sliderImageSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Slider", sliderSchema);
