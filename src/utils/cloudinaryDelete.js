const cloudinary = require("cloudinary").v2;

const deleteFromCloudinary = async (public_id) => {
  if (!public_id) return;

  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (err) {
    console.error("Cloudinary delete error:", err.message);
  }
};

module.exports = deleteFromCloudinary;