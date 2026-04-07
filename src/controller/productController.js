const Product = require("../model/Product.js");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const cloudinary = require("../../config/cloudinary.js");
const slugify = require("../utils/slugify");
const uploadPdfToSupabase = require("../utils/supabasePdfUpload");
const deletePdfFromSupabase = require("../utils/deletePdfFromSupabase.js");

/* ===================== HELPERS ===================== */

const normalizePdf = (pdf = {}) => ({
  quickstartpdfs: Array.isArray(pdf.quickstartpdfs) ? pdf.quickstartpdfs : [],
  downloadpdfs: Array.isArray(pdf.downloadpdfs) ? pdf.downloadpdfs : [],
});

const safeParse = (value, fallback) => {
  try {
    if (!value || value === "null") return fallback;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};


const normalizeArray = (arr) => (Array.isArray(arr) ? arr : []);

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
      buylink
    } = req.body;

    if (!title || !description || !parentCategory) {
      return res.status(400).json({
        success: false,
        message: "Title, description & parent category are required",
      });
    }

    const slug = slugify(title, { lower: true, strict: true });

    const images = req.files?.images || [];
    const videos = req.files?.videos || [];
    const featurePictures = req.files?.featurePictures || [];
    const quickstartPdfs = req.files?.quickstartpdfs || [];
    const downloadPdfs = req.files?.downloadpdfs || [];

    /* ---------- IMAGES → CLOUDINARY ---------- */
    const uploadedImages = await Promise.all(
      images.map((file) =>
        uploadToCloudinary(
          file.buffer,
          `products/images/${slug}`,
          file.mimetype,
          file.originalname
        )
      )
    );

    const uploadedFeaturePictures = await Promise.all(
      featurePictures.map((file) =>
        uploadToCloudinary(
          file.buffer,
          `products/feature-pictures/${slug}`,
          file.mimetype,
          file.originalname
        )
      )
    );

    /* ---------- VIDEOS → SUPABASE ---------- */
    const uploadedVideos = await Promise.all(
      videos.map((file) =>
        uploadPdfToSupabase(file, `products/${slug}/videos`)
      )
    );

    /* ---------- PDFs → SUPABASE ---------- */
    const quickstartpdfs = await Promise.all(
      quickstartPdfs.map((file) =>
        uploadPdfToSupabase(file, `products/${slug}/quickstart`)
      )
    );

    const downloadpdfs = await Promise.all(
      downloadPdfs.map((file) =>
        uploadPdfToSupabase(file, `products/${slug}/download`)
      )
    );

    /* ---------- BUY LINKS ---------- */

    let parsedBuyLinks = safeParse(buylink, []);

    if (parsedBuyLinks.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 buy links allowed",
      });
    }

    parsedBuyLinks = parsedBuyLinks.map((company) => ({
      companyname: company.companyname,
      items: [
        {
          image: company.items?.[0]?.image || "", // logo URL
          link: company.items?.[0]?.link || "",
        },
      ],
    }));

    /* ---------- CREATE PRODUCT ---------- */

    const product = await Product.create({
      title,
      subtitle,
      slug,
      description,
      uspPoints: safeParse(uspPoints, []),
      parentCategory,
      subCategory,
      status,
      buylink: parsedBuyLinks,
      featured: featured === "true" || featured === true,
      parameters: safeParse(parameters, []),

      images: uploadedImages.map((img) => ({
        url: img.secure_url,
        public_id: img.public_id,
      })),

      featurePictures: uploadedFeaturePictures.map((img) => ({
        url: img.secure_url,
        public_id: img.public_id,
      })),

      videos: uploadedVideos,

      pdf: { quickstartpdfs, downloadpdfs },
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });

  } catch (error) {

    console.error("CREATE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });

  }
};


/* ===================== DELETE PRODUCT ===================== */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    /* ---------- DELETE IMAGES (CLOUDINARY) ---------- */
    if (Array.isArray(product.images)) {
      for (const img of product.images) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
    }

    /* ---------- DELETE FEATURE PICTURES ---------- */
    if (Array.isArray(product.featurePictures)) {
      for (const img of product.featurePictures) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
    }

    /* ---------- DELETE VIDEOS (SUPABASE) ---------- */
    if (Array.isArray(product.videos) && product.videos.length) {
      const paths = product.videos.map(v => v.path).filter(Boolean);
      if (paths.length) {
        await deletePdfFromSupabase(paths);
      }
    }

    /* ---------- DELETE PDFs (SUPABASE) ---------- */
    if (product.pdf) {
      const pdfPaths = [];

      if (Array.isArray(product.pdf.quickstartpdfs)) {
        product.pdf.quickstartpdfs.forEach(p => p.path && pdfPaths.push(p.path));
      }

      if (Array.isArray(product.pdf.downloadpdfs)) {
        product.pdf.downloadpdfs.forEach(p => p.path && pdfPaths.push(p.path));
      }

      if (pdfPaths.length) {
        await deletePdfFromSupabase(pdfPaths);
      }
    }

    /* ---------- DELETE PRODUCT ---------- */
    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


/* ===================== UPDATE PRODUCT ===================== */
exports.updateProduct = async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    /* ---------- SAFE NORMALIZATION ---------- */

    product.images = normalizeArray(product.images);
    product.featurePictures = normalizeArray(product.featurePictures);
    product.videos = normalizeArray(product.videos);
    product.pdf = normalizePdf(product.pdf);
    product.buylink = normalizeArray(product.buylink);

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
      removeQuickstartIndices,
      removeDownloadIndices,
    } = req.body;

    const slug = slugify(title || product.title, {
      lower: true,
      strict: true,
    });

    /* ---------- BASIC FIELDS ---------- */

    if (title) {
      product.title = title;
      product.slug = slug;
    }

    if (subtitle) product.subtitle = subtitle;
    if (description) product.description = description;
    if (parentCategory) product.parentCategory = parentCategory;
    if (subCategory) product.subCategory = subCategory;
    if (status) product.status = status;

    if (uspPoints !== undefined) {
      product.uspPoints = safeParse(uspPoints, []);
    }

    if (featured !== undefined) {
      product.featured = featured === "true" || featured === true;
    }

    /* ---------- REMOVE IMAGES ---------- */

    if (removeImages) {

      const ids = safeParse(removeImages, []);

      product.images = product.images.filter(
        (img) => !ids.includes(img.public_id)
      );

      for (const id of ids) {
        await cloudinary.uploader.destroy(id);
      }

    }

    /* ---------- REMOVE FEATURE PICTURES ---------- */

    if (removeFeaturePictures) {

      const ids = safeParse(removeFeaturePictures, []);

      product.featurePictures = product.featurePictures.filter(
        (img) => !ids.includes(img.public_id)
      );

      for (const id of ids) {
        await cloudinary.uploader.destroy(id);
      }

    }

    /* ---------- REMOVE VIDEOS ---------- */

    if (removeVideos) {

      const paths = safeParse(removeVideos, []);

      await deletePdfFromSupabase(paths);

      product.videos = product.videos.filter(
        (v) => !paths.includes(v.path)
      );

    }

    /* ---------- REMOVE PDFs ---------- */

    if (removeQuickstartIndices) {

      const indices = safeParse(removeQuickstartIndices, []);

      product.pdf.quickstartpdfs =
        product.pdf.quickstartpdfs.filter((_, i) => !indices.includes(i));

    }

    if (removeDownloadIndices) {

      const indices = safeParse(removeDownloadIndices, []);

      product.pdf.downloadpdfs =
        product.pdf.downloadpdfs.filter((_, i) => !indices.includes(i));

    }

    /* ---------- UPDATE BUYLINK ---------- */

    if (buylink !== undefined) {

      let parsedBuyLinks = safeParse(buylink, []);

      if (parsedBuyLinks.length > 10) {
        return res.status(400).json({
          success: false,
          message: "Maximum 10 buy links allowed",
        });
      }

      parsedBuyLinks = parsedBuyLinks.map((company) => ({
        companyname: company.companyname,
        items: [
          {
            image: company.items?.[0]?.image || "",
            link: company.items?.[0]?.link || "",
          },
        ],
      }));

      product.buylink = parsedBuyLinks;

    }

    /* ---------- ADD IMAGES ---------- */

    const newImages = req.files?.images || [];

    if (newImages.length) {

      const uploaded = await Promise.all(
        newImages.map((file) =>
          uploadToCloudinary(
            file.buffer,
            `products/images/${slug}`,
            file.mimetype,
            file.originalname
          )
        )
      );

      product.images.push(
        ...uploaded.map((img) => ({
          url: img.secure_url,
          public_id: img.public_id,
        }))
      );

    }

    /* ---------- ADD FEATURE PICTURES ---------- */

    const newFeaturePictures = req.files?.featurePictures || [];

    if (newFeaturePictures.length) {

      if (product.featurePictures.length + newFeaturePictures.length > 10) {
        return res.status(400).json({
          success: false,
          message: "Maximum 10 feature pictures allowed",
        });
      }

      const uploaded = await Promise.all(
        newFeaturePictures.map((file) =>
          uploadToCloudinary(
            file.buffer,
            `products/feature-pictures/${slug}`,
            file.mimetype,
            file.originalname
          )
        )
      );

      product.featurePictures.push(
        ...uploaded.map((img) => ({
          url: img.secure_url,
          public_id: img.public_id,
        }))
      );

    }

    /* ---------- PARAMETERS ---------- */

    if (parameters !== undefined) {
      product.parameters = safeParse(parameters, []);
    }

    /* ---------- ADD VIDEOS ---------- */

    const newVideos = req.files?.videos || [];

    const uploadedVideos = await Promise.all(
      newVideos.map((file) =>
        uploadPdfToSupabase(file, `products/${slug}/videos`)
      )
    );

    product.videos.push(...uploadedVideos);

    /* ---------- ADD PDFs ---------- */

    const quickstartPdfs = req.files?.quickstartpdfs || [];
    const downloadPdfs = req.files?.downloadpdfs || [];

    const newQuick = await Promise.all(
      quickstartPdfs.map((file) =>
        uploadPdfToSupabase(file, `products/${slug}/quickstart`)
      )
    );

    const newDownload = await Promise.all(
      downloadPdfs.map((file) =>
        uploadPdfToSupabase(file, `products/${slug}/download`)
      )
    );

    product.pdf.quickstartpdfs.push(...newQuick);
    product.pdf.downloadpdfs.push(...newDownload);

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });

  } catch (error) {

    console.error("UPDATE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });

  }
};


/* ===================== GET PRODUCT ===================== */
exports.getProduct = async (req, res) => {
  try {
    const { parentCategory, productTitle } = req.params;

    // slugify function SAME as frontend
    const slugify = (s = "") =>
      s
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-");

    // fetch all matching parentCategory candidates first
    const products = await Product.find({ status: "active" });

    const product = products.find(p =>
      slugify(p.parentCategory) === parentCategory.toLowerCase() &&
      slugify(p.title) === productTitle.toLowerCase()
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      product,
    });

  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// exports.getProduct = async (req, res) => {
//   try {
//     const { parentCategory, productTitle } = req.params;

//     const product = await Product.findOne({
//       parentCategory,
//       title: productTitle,
//       status: "active",
//     });

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Data fetched successfully",
//       product,
//     });
//   } catch (error) {
//     console.error("GET PRODUCT ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };

/* ===================== GET ALL PRODUCTS ===================== */
exports.getallProducts = async (req, res) => {
  try {
    const allproducts = await Product.find();

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
  try {
    const allproducts = await Product.find({ status: "active" });

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

exports.getallparentcategory = async (req, res) => {
  try {
    const allproducts = await Product.find({}, '-__v -createdAt -updatedAt -images -pdf -videos -featurePictures -parameters -description -uspPoints');

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

exports.getallfrontendparentcategory = async (req, res) => {
  try {
    const allproducts = await Product.find({ status: "active" }, '-__v -createdAt -updatedAt -images -pdf -videos -featurePictures -parameters -description -uspPoints');

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

/* ===================== GET FEATURED PRODUCTS ===================== */
exports.getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await Product.find({ featured: true });

    if (featuredProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No featured products found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Featured products fetched successfully",
      featuredProducts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
