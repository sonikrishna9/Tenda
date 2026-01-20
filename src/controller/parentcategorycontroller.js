const ParentCategory = require("../model/parentcategorymodel.js");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const slugify = require("../utils/slugify.js");
const cloudinary = require("../../config/cloudinary.js")

exports.createparentcategory = async (req, res) => {
    try {
        /* ---------------------------------
           1. SAFE BODY ACCESS
        ----------------------------------*/
        const categoryname = req.body && req.body.categoryname;

        if (!categoryname || categoryname.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Parent category is required",
            });
        }

        /* ---------------------------------
           2. IMAGE VALIDATION (controller only)
        ----------------------------------*/
        const images = req.files && req.files.images;

        // ❌ no image
        if (!images || images.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Exactly one image is required",
            });
        }

        // ❌ more than one image
        if (images.length > 1) {
            return res.status(400).json({
                success: false,
                message: "Only one image is allowed",
            });
        }

        const image = images[0];

        if (!image || !image.buffer) {
            return res.status(400).json({
                success: false,
                message: "Invalid image file",
            });
        }

        /* ---------------------------------
           3. CLOUDINARY UPLOAD
        ----------------------------------*/
        const slug = slugify(categoryname);

        const uploadimage = await uploadToCloudinary(
            image.buffer,
            `category/images/${slug}`,
            image.mimetype,
            image.originalname
        );

        if (!uploadimage || !uploadimage.secure_url) {
            return res.status(500).json({
                success: false,
                message: "Image upload failed",
            });
        }

        /* ---------------------------------
           4. SAVE TO DATABASE
        ----------------------------------*/
        const parentcategorydata = await ParentCategory.create({
            categoryname,
            images: {
                url: uploadimage.secure_url,
                public_id: uploadimage.public_id,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Parent category created successfully",
            parentcategory: parentcategorydata,
        });

    } catch (error) {
        console.error("Create Parent Category Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

exports.getcategory = async (req, res) => {
    try {
        const parentcategory = await ParentCategory.find()

        if (!parentcategory) {
            return res.status(404).json({
                success: false,
                message: "Parent Category not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Parent Category Fetched Successfully",
            parentcategory
        })
    }
    catch (error) {
        return res.status(500).json({
            success: true,
            message: "Internal Server Error",
            error: error.message
        })
    }
}


exports.updatecategory = async (req, res) => {
    try {
        /* ---------------------------------
           1. FIND CATEGORY
        ----------------------------------*/
        const category = await ParentCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        /* ---------------------------------
           2. UPDATE CATEGORY NAME (OPTIONAL)
        ----------------------------------*/
        if (req.body?.categoryname) {
            category.categoryname = req.body.categoryname.trim();
        }

        /* ---------------------------------
           3. IMAGE UPDATE (OPTIONAL)
        ----------------------------------*/
        const images = req.files?.images;

        if (images) {
            // ❌ more than one image
            if (images.length > 1) {
                return res.status(400).json({
                    success: false,
                    message: "Only one image is allowed",
                });
            }

            const image = images[0];

            if (!image?.buffer) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid image file",
                });
            }

            // 🔥 Delete old image from Cloudinary
            if (category.images?.public_id) {
                await cloudinary.uploader.destroy(category.images.public_id);
            }

            const slug = slugify(category.categoryname);

            // Upload new image
            const uploadimage = await uploadToCloudinary(
                image.buffer,
                `category/images/${slug}`,
                image.mimetype,
                image.originalname
            );

            if (!uploadimage?.secure_url) {
                return res.status(500).json({
                    success: false,
                    message: "Image upload failed",
                });
            }

            category.images = {
                url: uploadimage.secure_url,
                public_id: uploadimage.public_id,
            };
        }

        /* ---------------------------------
           4. SAVE UPDATED CATEGORY
        ----------------------------------*/
        await category.save();

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category,
        });

    } catch (error) {
        console.error("Update Category Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

