const Product = require("../model/Product.js");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const slugify = require("../utils/slugify");

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
      timing,
    } = req.body;


    if (!title || !description || !parentCategory) {
      return res.status(400).json({
        success: false,
        message: "Title, description & parent category are required",
      });
    }


    let files = [];

    if (req.files && req.files.length > 0) {
      files = req.files;
    } else if (req.file) {
      files = [req.file];
    } else {
      return res.status(400).json({
        success: false,
        message: "At least one image file is required",
      });
    }


    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    for (const file of files) {
      if (!allowedImageTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Only image files are allowed in this API",
        });
      }
    }


    if (req.route.path === "/multiple" && files.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Minimum 2 images are required",
      });
    }

    if (req.route.path === "/single" && files.length !== 1) {
      return res.status(400).json({
        success: false,
        message: "Only 1 image is allowed",
      });
    }


    const productSlug = slugify(title);
    const folderPath = `images/products/${productSlug}`;


    const uploads = files.map((file) =>
      uploadToCloudinary(
        file.buffer,
        folderPath,
        file.mimetype
      )
    );

    const results = await Promise.all(uploads);


    const product = await Product.create({
      title,
      subtitle,
      description,
      uspPoints: uspPoints ? JSON.parse(uspPoints) : [],
      parentCategory,
      subCategory,
      status,
      timing,
      images: results.map((img) => ({
        url: img.secure_url,
        public_id: img.public_id,
      })),
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
