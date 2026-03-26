const mongoose = require("mongoose");

const parentcategoryschema = new mongoose.Schema(
  {
    categoryname: {
      type: String,
      required: true,
      trim: true
    },

    subcategories: [
      {
        name: {
          type: String,
          required: true,
          trim: true
        }
      }
    ],

    images: {
      url: String,
      public_id: String
    },

    status: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ParentCategory", parentcategoryschema);