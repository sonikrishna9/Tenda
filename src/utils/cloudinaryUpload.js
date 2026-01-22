const cloudinary = require("../../config/cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = (buffer, folder, mimetype) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

module.exports = uploadToCloudinary;
