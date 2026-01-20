const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "application/pdf",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

module.exports = {
  uploadMixed: upload.fields([
    { name: "images", maxCount: 7 },          // Cloudinary
    { name: "video", maxCount: 10 },             // Cloudinary

    // 🔥 PDF fields (Supabase)
    { name: "quickstartpdf", maxCount: 5 },     // multiple allowed
    { name: "downloadpdf", maxCount: 5 },       // multiple allowed
  ]),
};
