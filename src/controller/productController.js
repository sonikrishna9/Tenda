const Product = require("../model/Product.js");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const cloudinary = require("../../config/cloudinary.js");
const slugify = require("../utils/slugify");
const uploadPdfToSupabase = require("../utils/supabasePdfUpload");
const deletePdfFromSupabase = require("../utils/deletePdfFromSupabase.js")

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

    const productSlug = slugify(title);

    /* ---------- FILE EXTRACTION ---------- */
    const images = req.files?.images || [];
    const videos = req.files?.video || [];

    // 🔥 MULTIPLE PDFs
    const quickstartPdfs = req.files?.quickstartpdf || [];
    const downloadPdfs = req.files?.downloadpdf || [];

    /* ---------- CLOUDINARY UPLOAD (UNCHANGED) ---------- */
    const imageResults = await Promise.all(
      images.map((file) =>
        uploadToCloudinary(
          file.buffer,
          `images/products/${productSlug}`,
          file.mimetype,
          file.originalname
        )
      )
    );

    const videoResults = await Promise.all(
      videos.map((file) =>
        uploadToCloudinary(
          file.buffer,
          `videos/products/${productSlug}`,
          file.mimetype,
          file.originalname
        )
      )
    );

    /* ---------- SUPABASE PDF UPLOAD (MULTIPLE) ---------- */
    let quickstartPdfUrl = "";
    let downloadPdfUrl = "";
    let pdfPublicIds = [];

    // Upload quickstart PDFs
    for (let i = 0; i < quickstartPdfs.length; i++) {
      const result = await uploadPdfToSupabase(
        quickstartPdfs[i],
        `products/${productSlug}/pdfs`
      );

      if (i === 0) quickstartPdfUrl = result.url; // main pdf
      pdfPublicIds.push(result.path);
    }

    // Upload download PDFs
    for (let i = 0; i < downloadPdfs.length; i++) {
      const result = await uploadPdfToSupabase(
        downloadPdfs[i],
        `products/${productSlug}/pdfs`
      );

      if (i === 0) downloadPdfUrl = result.url; // main pdf
      pdfPublicIds.push(result.path);
    }

    /* ---------- CREATE PRODUCT ---------- */
    const product = await Product.create({
      title,
      subtitle,
      description,
      uspPoints: uspPoints ? JSON.parse(uspPoints) : [],
      parentCategory,
      subCategory,
      status,
      timing,

      // 🔥 FEATURE FLAG (SAFE)
      featured: featured === "true" || featured === true,

      images: imageResults.map((img) => ({
        url: img.secure_url,
        public_id: img.public_id,
      })),

      videos: videoResults.map((vid) => ({
        url: vid.secure_url,
        public_id: vid.public_id,
      })),

      pdf: {
        quickstartpdf: quickstartPdfUrl,
        downloadpdf: downloadPdfUrl,
        public_id: pdfPublicIds,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 🔐 Ensure pdf object exists (old products safety)
    if (!product.pdf) {
      product.pdf = {
        quickstartpdf: "",
        downloadpdf: "",
        public_id: [],
      };
    }

    const {
      title,
      subtitle,
      description,
      parentCategory,
      subCategory,
      status,
      uspPoints,
      featured, // 🔥 NEW (OPTIONAL)
      removeImages,
      removeVideo,
      removeQuickstart,
      removeDownload,
    } = req.body;

    const productSlug = slugify(title || product.title);

    /* ===================== BASIC FIELDS ===================== */
    if (title) product.title = title;
    if (subtitle) product.subtitle = subtitle;
    if (description) product.description = description;
    if (parentCategory) product.parentCategory = parentCategory;
    if (subCategory) product.subCategory = subCategory;
    if (status) product.status = status;
    if (uspPoints) product.uspPoints = JSON.parse(uspPoints);

    // 🔥 FEATURED PRODUCT UPDATE (SAFE)
    if (featured !== undefined) {
      product.featured = featured === "true" || featured === true;
    }

    /* ===================== REMOVE IMAGES ===================== */
    if (removeImages) {
      const imagesToRemove = JSON.parse(removeImages);

      for (const publicId of imagesToRemove) {
        await cloudinary.uploader.destroy(publicId);
      }

      product.images = product.images.filter(
        (img) => !imagesToRemove.includes(img.public_id)
      );
    }

    /* ===================== REMOVE VIDEO ===================== */
    if (removeVideo === "true" || removeVideo === true) {
      for (const vid of product.videos) {
        await cloudinary.uploader.destroy(vid.public_id, {
          resource_type: "video",
        });
      }
      product.videos = [];
    }

    /* ===================== REMOVE PDFs ===================== */
    if (removeQuickstart === "true" || removeQuickstart === true) {
      await deletePdfFromSupabase(product.pdf.quickstartpdf);
      product.pdf.quickstartpdf = "";
    }

    if (removeDownload === "true" || removeDownload === true) {
      await deletePdfFromSupabase(product.pdf.downloadpdf);
      product.pdf.downloadpdf = "";
    }

    /* ===================== UPLOAD IMAGES ===================== */
    const newImages = req.files?.images || [];

    if (newImages.length > 0) {
      const imageResults = await Promise.all(
        newImages.map((file) =>
          uploadToCloudinary(
            file.buffer,
            `images/products/${productSlug}`,
            file.mimetype,
            file.originalname
          )
        )
      );

      product.images.push(
        ...imageResults.map((img) => ({
          url: img.secure_url,
          public_id: img.public_id,
        }))
      );
    }

    /* ===================== UPLOAD VIDEO ===================== */
    const newVideos = req.files?.video || [];

    if (newVideos.length > 0) {
      for (const vid of product.videos) {
        await cloudinary.uploader.destroy(vid.public_id, {
          resource_type: "video",
        });
      }

      const videoResults = await Promise.all(
        newVideos.map((file) =>
          uploadToCloudinary(
            file.buffer,
            `videos/products/${productSlug}`,
            file.mimetype,
            file.originalname
          )
        )
      );

      product.videos = videoResults.map((vid) => ({
        url: vid.secure_url,
        public_id: vid.public_id,
      }));
    }

    /* ===================== UPLOAD PDFs ===================== */
    const quickstartPdfs = req.files?.quickstartpdf || [];
    const downloadPdfs = req.files?.downloadpdf || [];

    for (let i = 0; i < quickstartPdfs.length; i++) {
      const result = await uploadPdfToSupabase(
        quickstartPdfs[i],
        `products/${productSlug}/pdfs`
      );

      if (i === 0) product.pdf.quickstartpdf = result.url;
      product.pdf.public_id.push(result.path);
    }

    for (let i = 0; i < downloadPdfs.length; i++) {
      const result = await uploadPdfToSupabase(
        downloadPdfs[i],
        `products/${productSlug}/pdfs`
      );

      if (i === 0) product.pdf.downloadpdf = result.url;
      product.pdf.public_id.push(result.path);
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
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

