const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: String,
    description: { type: String, required: true },

    uspPoints: [String],

    parentCategory: { type: String, required: true },
    subCategory: String,

    images: [
      {
        url: String,
        public_id: String,
      },
    ],

    videos: [
      {
        url: String,
        public_id: String,
      },
    ],

    pdf: {
      quickstartpdf: { type: String },
      downloadpdf: { type: String },
      public_id: [{ type: String }],
    },

    // 🔥 NEW FEATURED FIELD (OPTIONAL)
    featured: {
      type: Boolean,
      default: false, // old products = NOT featured
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
