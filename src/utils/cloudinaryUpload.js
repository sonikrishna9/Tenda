const cloudinary = require("../../config/cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = (buffer, folderPath, mimetype, originalName) => {
  return new Promise((resolve, reject) => {
    let resourceType = "image";

    if (mimetype.startsWith("video/")) resourceType = "video";
    if (mimetype === "application/pdf") resourceType = "raw";

    const publicId = originalName
      ? originalName.replace(/\.[^/.]+$/, "") // remove extension
      : undefined;

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folderPath,
        resource_type: resourceType,
        public_id: publicId, // 👈 original name preserved
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

module.exports = uploadToCloudinary;
