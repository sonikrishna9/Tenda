const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    uspPoints: [
      {
        type: String,
        trim: true,
      },
    ],

    parentCategory: {
      type: String,
      required: true,
    },

    subCategory: {
      type: String,
    },

    images: [
      {
        url: String,
        public_id: String,
      },
    ],

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
