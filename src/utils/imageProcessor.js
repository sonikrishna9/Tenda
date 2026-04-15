const sharp = require("sharp");
const path = require("path");

const processImage = async (filePath) => {
  const outputPath = filePath.replace(/(\.\w+)$/, "-optimized.webp");

  await sharp(filePath)
    .resize(1200) // max width
    .webp({ quality: 80 })
    .toFile(outputPath);

  return outputPath;
};

module.exports = processImage;