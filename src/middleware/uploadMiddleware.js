const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "application/pdf",
  ];

  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

module.exports = {
  uploadMixed: upload.fields([
    { name: "images", maxCount: 7 },
    { name: "featurePictures", maxCount: 10 }, // ⭐ NEW
    { name: "videos", maxCount: 10 },
    { name: "quickstartpdfs", maxCount: 10 },
    { name: "downloadpdfs", maxCount: 20 },
  ]),
};
