// const multer = require("multer");

// const storage = multer.memoryStorage();

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image")) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only image files allowed"), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
// });

// module.exports = {
//   uploadSingle: upload.single("image"),   // for single image
//   uploadMultiple: upload.array("images", 5), // for multiple images
// };


const multer = require("multer")

const storage = multer.memoryStorage();

const filefilter = (req, file, cb) => {

  const allowMimeTypes = [
    // Images
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    // videos
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    //pdf
    "application/pdf",

  ]

  if (allowMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  }
  else {
    cb(new Error("Invalid file type. Only image, video or PDF allowed"), false);
  }

}

const upload = multer({
  storage,
  filefilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB (video ke liye safe)
  },
});

module.exports = {
  uploadSingle: upload.single("file"),        // image / video / pdf
  uploadMultiple: upload.array("files", 10),  // mix allowed
};