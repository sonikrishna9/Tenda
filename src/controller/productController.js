const Product = require("../model/Product.js");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const cloudinary = require("../../config/cloudinary.js");
const slugify = require("../utils/slugify");
const uploadPdfToSupabase = require("../utils/supabasePdfUpload");
const deletePdfFromSupabase = require("../utils/deletePdfFromSupabase.js")


const normalizePdf = (pdf = {}) => {
  return {
    quickstartpdfs: Array.isArray(pdf.quickstartpdfs)
      ? pdf.quickstartpdfs
      : [],
    downloadpdfs: Array.isArray(pdf.downloadpdfs)
      ? pdf.downloadpdfs
      : [],
  };
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
    } = req.body;

    if (!title || !description || !parentCategory) {
      return res.status(400).json({
        success: false,
        message: "Title, description & parent category are required",
      });
    }

    const slug = slugify(title);

    const images = req.files?.images || [];
    const videos = req.files?.videos || [];
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

    /* ---------- VIDEOS → SUPABASE ---------- */
    const uploadedVideos = [];
    for (const file of videos) {
      const result = await uploadPdfToSupabase(
        file,
        `products/${slug}/videos`
      );
      uploadedVideos.push(result);
    }

    /* ---------- PDFs → SUPABASE ---------- */
    const quickstartpdfs = [];
    const downloadpdfs = [];

    for (const file of quickstartPdfs) {
      const result = await uploadPdfToSupabase(
        file,
        `products/${slug}/quickstart`
      );
      quickstartpdfs.push(result);
    }

    for (const file of downloadPdfs) {
      const result = await uploadPdfToSupabase(
        file,
        `products/${slug}/download`
      );
      downloadpdfs.push(result);
    }

    const product = await Product.create({
      title,
      subtitle,
      description,
      uspPoints: uspPoints ? JSON.parse(uspPoints) : [],
      parentCategory,
      subCategory,
      status,
      featured: featured === "true" || featured === true,

      images: uploadedImages.map((img) => ({
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

/* ===================== UPDATE PRODUCT ===================== */
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

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

      parameters, // ⭐ FRONTEND SE AAYEGA (FULL ARRAY)

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
    if (title) product.title = title;
    if (subtitle) product.subtitle = subtitle;
    if (description) product.description = description;
    if (parentCategory) product.parentCategory = parentCategory;
    if (subCategory) product.subCategory = subCategory;
    if (status) product.status = status;
    if (uspPoints) {
      try {
        product.uspPoints = JSON.parse(uspPoints);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid uspPoints format",
        });
      }
    }
    if (featured !== undefined) {
      product.featured = featured === "true" || featured === true;
    }

    /* ---------- REMOVE IMAGES ---------- */
    if (removeImages) {
      let ids = [];
      try {
        ids = JSON.parse(removeImages);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid removeImages format",
        });
      }

      product.images = product.images.filter(
        (img) => !ids.includes(img.public_id)
      );
    }


    /* ---------- REMOVE FEATURE PICTURES ---------- */
    if (removeFeaturePictures) {
      const ids = JSON.parse(removeFeaturePictures);

      product.featurePictures = product.featurePictures.filter(
        (img) => !ids.includes(img.public_id)
      );

      // optional: cloudinary delete
      for (const id of ids) {
        try {
          await deleteFromCloudinary(id);
        } catch (err) {
          console.warn("Cloudinary delete failed:", id);
        }
      }

    }


    /* ---------- REMOVE VIDEOS ---------- */
    if (removeVideos) {
      const paths = JSON.parse(removeVideos);

      await deletePdfFromSupabase(paths);
      console.log("🧨 DELETE REQUEST PATHS:", paths);


      product.videos = product.videos.filter(
        (v) => !paths.includes(v.path)
      );
    }


    /* ---------- REMOVE PDFs ---------- */
    if (removeQuickstartIndices) {
      const indices = JSON.parse(removeQuickstartIndices);
      product.pdf.quickstartpdfs =
        product.pdf.quickstartpdfs.filter((_, i) => !indices.includes(i));
    }

    if (removeDownloadIndices) {
      const indices = JSON.parse(removeDownloadIndices);
      product.pdf.downloadpdfs =
        product.pdf.downloadpdfs.filter((_, i) => !indices.includes(i));
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
      const total =
        product.featurePictures.length + newFeaturePictures.length;

      if (total > 10) {
        return res.status(400).json({
          success: false,
          message: "Maximum 10 feature pictures allowed",
        });
      }

      const uploaded = await Promise.all(
        newFeaturePictures.map((file) =>
          uploadToCloudinary(
            file.buffer,
            `products/featurepictures/${slug}`, // ⭐ REQUIRED FOLDER
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

    /* ---------- PARAMETERS (EDIT + DELETE SAFE) ---------- */
    if (parameters !== undefined) {
      let parsedParameters;

      try {
        parsedParameters = JSON.parse(parameters);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid parameters format",
        });
      }

      // 🛡️ Defensive validation (optional but recommended)
      if (!Array.isArray(parsedParameters)) {
        return res.status(400).json({
          success: false,
          message: "Parameters must be an array",
        });
      }

      // 🧹 Clean & normalize data (frontend UX ke hisaab se)
      product.parameters = parsedParameters
        .filter((p) => p && typeof p === "object")
        .map((p) => ({
          title: p.title || "",
          items: Array.isArray(p.items)
            ? p.items
              .filter((i) => i && typeof i === "object")
              .map((i) => ({
                title: i.title || "",
                subtitle: i.subtitle || "",
              }))
            : [],
        }));
    }



    /* ---------- ADD VIDEOS ---------- */
    const newVideos = req.files?.videos || [];
    for (const file of newVideos) {
      const result = await uploadPdfToSupabase(
        file,
        `products/${slug}/videos`
      );
      product.videos.push(result);
    }

    /* ---------- ADD PDFs ---------- */
    const quickstartPdfs = req.files?.quickstartpdfs || [];
    const downloadPdfs = req.files?.downloadpdfs || [];

    for (const file of quickstartPdfs) {
      const result = await uploadPdfToSupabase(
        file,
        `products/${slug}/quickstart`
      );
      product.pdf.quickstartpdfs.push(result);
    }

    for (const file of downloadPdfs) {
      const result = await uploadPdfToSupabase(
        file,
        `products/${slug}/download`
      );
      product.pdf.downloadpdfs.push(result);
    }

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


exports.getProduct = async (req, res) => {
  try {
    const { parentCategory, subCategory } = req.params

    if (!parentCategory || !subCategory) {
      return res.status(400).json({
        success: false,
        message: "Parent & Subcategory Should be required"
      })
    }

    const isexists = await Product.findOne({
      parentCategory, subCategory, status: "active"
    })

    if (!isexists) {
      return res.status(404).json({
        success: false,
        message: "Product not found with given Parent & SubCategory",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Data Fetched sucessfully",
      category: isexists
    })


  }
  catch (error) {
    console.error("Get Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}

exports.getallProducts = async (req, res) => {
  try {
    const allproducts = await Product.find()

    if (allproducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Products not found"
      })
    }

    return res.status(200).json({
      success: true,
      message: "All Proucts data fetched sucessfully",
      allproducts
    })
  }
  catch (error) {
    console.error("All Products error", error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    })
  }
}

exports.getfeaturedProduts = async (req, res) => {
  try {
    const featuredProducts = await Product.find({ featured: true })

    if (!featuredProducts) {
      return res.status(404).json({
        success: false,
        message: "Featured Product not Found."
      })
    }

    return res.status(200).json({
      success: true,
      message: "Featured Product fetched successfully",
      featuredProducts
    })

  }
  catch (error) {
    return res.status(500).json({
      sucess: false,
      message: "Internal Server Error",
      error
    })
  }
}

