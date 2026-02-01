const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },

    author: {
      name: { type: String, required: true },
    },

    featuredImage: {
      url: { type: String, required: true },
      public_id: String,
    },

    gallery: [
      {
        url: String,
        public_id: String,
      },
    ],

    category: { type: String, required: true },

    tags: [String],

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Blog || mongoose.model("Blog", blogSchema);
