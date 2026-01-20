const mongoose = require("mongoose");

const parentcategoryschema = new mongoose.Schema(
  {
    categoryname: {
      type: String,
      required: [true, "Category Name should be required"],
      trim: true
    },

    images: {
      url: {
        type: String,
        required: [true, "Image URL is required"]
      },
      public_id: {
        type: String,
        required: [true, "Image public_id is required"]
      }
    },

    status: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ParentCategory", parentcategoryschema);
