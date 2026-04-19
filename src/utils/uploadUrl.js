const path = require("path");

const buildUploadUrl = (...segments) => path.posix.join("/uploads", ...segments);

module.exports = {
  buildUploadUrl,
};
