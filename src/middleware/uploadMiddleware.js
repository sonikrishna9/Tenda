const fs = require("fs");
const path = require("path");
const multer = require("multer");

/* ===================== AUTO FOLDER CREATE ===================== */
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/* ===================== STORAGE ===================== */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const base = path.join(
      __dirname,
      "../../public/uploads/products/"
    );

    let folder = "";

    if (file.fieldname === "images") folder = "images/";
    else if (file.fieldname === "featurePictures")
      folder = "feature-pictures/";
    else if (file.fieldname === "videos") folder = "videos/";
    else if (file.fieldname === "bannerImage") folder = "images/"; // 🔥 ADD THIS
    else if (file.fieldname === "logo") folder = "images/";
    else folder = "pdfs/";

    const finalPath = path.join(base, folder);

    ensureDir(finalPath); // ✅ auto create folder

    cb(null, finalPath);
  },

  filename: function (req, file, cb) {
    const cleanName = file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.-]/g, "");
    const uniqueName = Date.now() + "-" + cleanName;

    cb(null, uniqueName);
  },
});

/* ===================== FILE FILTER ===================== */
const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "video/mp4",
    "application/pdf",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

/* ===================== MULTER ===================== */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
});

/* ===================== EXPORT ===================== */
module.exports = {
  uploadMixed: upload.fields([
    { name: "images", maxCount: 7 },
    { name: "featurePictures", maxCount: 10 },
    { name: "videos", maxCount: 10 },
    { name: "quickstartpdfs", maxCount: 10 },
    { name: "downloadpdfs", maxCount: 20 },
    { name: "bannerImage", maxCount: 1 },
    { name: "logo", maxCount: 1 }
  ]),
};