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
    featurePictures: [
      {
        url: String,
        public_id: String,
      },
    ],
    parameters: [
      {
        title: String,
        items: [
          {
            title: String,
            subtitle: String,
          },
        ],
      },
    ],
    buylink: [
      {
        companyname: String,
        items: [
          {
            image: String,
            link: String,
          },
        ],
      },
    ],
    videos: [
      {
        url: String,
        path: String,
      },
    ],
    pdf: {
      quickstartpdfs: [
        {
          url: String,
          path: String,
        },
      ],
      downloadpdfs: [
        {
          url: String,
          path: String,
        },
      ],
    },

    featured: {
      type: Boolean,
      default: false,
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
