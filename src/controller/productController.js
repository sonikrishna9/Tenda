const Product = require("../model/Product.js");
const slugify = require("../utils/slugify");
const path = require("path");
const fs = require("fs");
const processImage = require("../utils/imageProcessor");

/* ===================== CONFIG ===================== */

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

/* ===================== HELPERS ===================== */

const safeParse = (value, fallback) => {
  try {
    if (!value || value === "null") return fallback;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeArray = (arr) => (Array.isArray(arr) ? arr : []);

const normalizePdf = (pdf = {}) => ({
  quickstartpdfs: Array.isArray(pdf.quickstartpdfs) ? pdf.quickstartpdfs : [],
  downloadpdfs: Array.isArray(pdf.downloadpdfs) ? pdf.downloadpdfs : [],
});

/* ✅ FILE MAP */
const mapFiles = (files, folder) =>
  files.map((file) => ({
    url: `${BASE_URL}/uploads/products/${folder}/${file.filename}`,
    path: file.filename,
  }));

/* ✅ DELETE FILE */
const deleteFile = (fileName, folder) => {
  const filePath = path.join(
    __dirname,
    `../../public/uploads/products/${folder}/${fileName}`
  );

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

/* ===================== CREATE PRODUCT ===================== */

exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      uspPoints,
      parentCategory,
      subCategory,
      status,
      featured,
      parameters,
      buylink,
    } = req.body;

    if (!title || !description || !parentCategory) {
      return res.status(400).json({
        success: false,
        message: "Title, description & parent category are required",
      });
    }

    const slug = slugify(title, { lower: true, strict: true });

    const images = req.files?.images || [];
    const featurePictures = req.files?.featurePictures || [];
    const videos = req.files?.videos || [];
    const quickstartPdfs = req.files?.quickstartpdfs || [];
    const downloadPdfs = req.files?.downloadpdfs || [];

    const product = await Product.create({
      title,
      subtitle,
      slug,
      description,
      uspPoints: safeParse(uspPoints, []),
      parentCategory,
      subCategory,
      status,
      featured: featured === "true" || featured === true,
      parameters: safeParse(parameters, []),
      buylink: safeParse(buylink, []),

      images: mapFiles(images, "images"),
      featurePictures: mapFiles(featurePictures, "feature-pictures"),
      videos: mapFiles(videos, "videos"),

      pdf: {
        quickstartpdfs: mapFiles(quickstartPdfs, "pdfs"),
        downloadpdfs: mapFiles(downloadPdfs, "pdfs"),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    return res.status(500).json({ success: false });
  }
};

/* ===================== DELETE PRODUCT ===================== */

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ success: false, message: "Not found" });

    product.images.forEach((img) => deleteFile(img.path, "images"));
    product.featurePictures.forEach((img) =>
      deleteFile(img.path, "feature-pictures")
    );
    product.videos.forEach((v) => deleteFile(v.path, "videos"));

    product.pdf?.quickstartpdfs?.forEach((p) =>
      deleteFile(p.path, "pdfs")
    );
    product.pdf?.downloadpdfs?.forEach((p) =>
      deleteFile(p.path, "pdfs")
    );

    await product.deleteOne();

    return res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return res.status(500).json({ success: false });
  }
};

/* ===================== UPDATE PRODUCT ===================== */

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ success: false, message: "Not found" });

    product.images = normalizeArray(product.images);
    product.featurePictures = normalizeArray(product.featurePictures);
    product.videos = normalizeArray(product.videos);
    product.pdf = normalizePdf(product.pdf);

    const {
      title,
      subtitle,
      description,
      parentCategory,
      subCategory,
      status,
      uspPoints,
      featured,
      parameters,
      buylink,
      removeImages,
      removeFeaturePictures,
      removeVideos,
    } = req.body;

    const slug = slugify(title || product.title, {
      lower: true,
      strict: true,
    });

    /* BASIC UPDATE */
    if (title) {
      product.title = title;
      product.slug = slug;
    }

    if (subtitle) product.subtitle = subtitle;
    if (description) product.description = description;
    if (parentCategory) product.parentCategory = parentCategory;
    if (subCategory) product.subCategory = subCategory;
    if (status) product.status = status;

    if (uspPoints !== undefined)
      product.uspPoints = safeParse(uspPoints, []);

    if (featured !== undefined)
      product.featured = featured === "true" || featured === true;

    if (parameters !== undefined)
      product.parameters = safeParse(parameters, []);

    if (buylink !== undefined)
      product.buylink = safeParse(buylink, []);

    /* REMOVE FILES */

    if (removeImages) {
      const ids = safeParse(removeImages, []);
      product.images = product.images.filter((img) => {
        if (ids.includes(img.path)) {
          deleteFile(img.path, "images");
          return false;
        }
        return true;
      });
    }

    if (removeFeaturePictures) {
      const ids = safeParse(removeFeaturePictures, []);
      product.featurePictures = product.featurePictures.filter((img) => {
        if (ids.includes(img.path)) {
          deleteFile(img.path, "feature-pictures");
          return false;
        }
        return true;
      });
    }

    if (removeVideos) {
      const ids = safeParse(removeVideos, []);
      product.videos = product.videos.filter((v) => {
        if (ids.includes(v.path)) {
          deleteFile(v.path, "videos");
          return false;
        }
        return true;
      });
    }

    /* ADD FILES */

    const newImages = req.files?.images || [];
    const newFeaturePictures = req.files?.featurePictures || [];
    const newVideos = req.files?.videos || [];
    const quickstartPdfs = req.files?.quickstartpdfs || [];
    const downloadPdfs = req.files?.downloadpdfs || [];

    product.images.push(...mapFiles(newImages, "images"));
    product.featurePictures.push(
      ...mapFiles(newFeaturePictures, "feature-pictures")
    );
    product.videos.push(...mapFiles(newVideos, "videos"));

    product.pdf.quickstartpdfs.push(
      ...mapFiles(quickstartPdfs, "pdfs")
    );
    product.pdf.downloadpdfs.push(
      ...mapFiles(downloadPdfs, "pdfs")
    );

    await product.save();

    return res.json({
      success: true,
      message: "Updated successfully",
      product,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    return res.status(500).json({ success: false });
  }
};

/* ===================== GET APIs ===================== */

exports.getProduct = async (req, res) => {
  try {
    const { parentCategory, productTitle } = req.params;

    const slugifyFn = (s = "") =>
      s
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

    const products = await Product.find({ status: "active" });

    const product = products.find(
      (p) =>
        slugifyFn(p.parentCategory) === parentCategory.toLowerCase() &&
        slugifyFn(p.title) === productTitle.toLowerCase()
    );

    if (!product)
      return res.status(404).json({ success: false });

    return res.json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

exports.getallProducts = async (req, res) => {
  const allproducts = await Product.find();
  res.json({ success: true, allproducts });
};

exports.getallfrontendparentcategory = async (req, res) => {
  try {
    const allproducts = await Product.find(
      { status: "active" },
      "-__v -createdAt -updatedAt -images -pdf -videos -featurePictures -parameters -description -uspPoints"
    );

    return res.status(200).json({
      success: true,
      message: "All products fetched successfully",
      allproducts,
    });
  } catch (error) {
    console.error("ALL PRODUCTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getallProductsFrontend = async (req, res) => {
  const allproducts = await Product.find({ status: "active" });
  res.json({ success: true, allproducts });
};

exports.getFeaturedProducts = async (req, res) => {
  const featuredProducts = await Product.find({ featured: true });
  res.json({ success: true, featuredProducts });
};

exports.getallparentcategory = async (req, res) => {
  const allproducts = await Product.find({}, "-images -pdf -videos");
  res.json({ success: true, allproducts });
};