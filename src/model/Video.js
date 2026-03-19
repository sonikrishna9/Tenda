// models/Video.js

const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true, // one slug = one document
      trim: true,
    },
    videos: [
      {
        type: String, // YouTube URL only
        required: true,
      },
    ],
  },
  { timestamps: true }
);

// ✅ EXPORT USING module.exports
module.exports = mongoose.model("Video", videoSchema);