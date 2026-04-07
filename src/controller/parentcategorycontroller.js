const ParentCategory = require("../model/parentcategorymodel.js");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const slugify = require("../utils/slugify.js");
const cloudinary = require("../../config/cloudinary.js")
// const deleteFromCloudinary = require("../utils/");


exports.createparentcategory = async (req, res) => {
    try {
        const { categoryname, subcategories } = req.body;

        if (!categoryname) {
            return res.status(400).json({
                success: false,
                message: "Category name required"
            });
        }

        // ✅ Parse subcategories (string -> array)
        let parsedSub = [];

        if (subcategories) {
            try {
                parsedSub = JSON.parse(subcategories);
                parsedSub = [...new Set(parsedSub)].map(name => ({ name }));
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid subcategories format"
                });
            }
        }

        // IMAGE (same as yours)
        const image = req.files?.images?.[0];

        if (!image || !image.buffer) {
            return res.status(400).json({
                success: false,
                message: "Image is required"
            });
        }

        const uploadimage = await uploadToCloudinary(
            image.buffer,
            `category/images/${slugify(categoryname)}`,
            image.mimetype,
            image.originalname
        );

        const category = await ParentCategory.create({
            categoryname,
            subcategories: parsedSub,
            images: {
                url: uploadimage.secure_url,
                public_id: uploadimage.public_id
            }
        });

        res.status(201).json({
            success: true,
            category
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
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

exports.getfrontendcategory = async (req, res) => {
    try {
        const parentcategory = await ParentCategory.find({ status: true })

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
        const category = await ParentCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const { categoryname, subcategories, status } = req.body;

        if (typeof status !== "undefined") {
            category.status = status === "true" || status === true;
        }

        if (categoryname) {
            category.categoryname = categoryname.trim();
        }

        // ✅ UPDATE SUBCATEGORIES
        let parsedSub = [];

        if (subcategories) {
            try {
                parsedSub = JSON.parse(subcategories);
                parsedSub = [...new Set(parsedSub)].map(name => ({ name }));
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid subcategories format"
                });
            }
        }

        // IMAGE UPDATE (same as yours)
        const image = req.files?.images?.[0];



        if (!image || !image.buffer) {
            return res.status(400).json({
                success: false,
                message: "Image is required"
            });
        }

        if (image) {
            if (category.images?.public_id) {
                await cloudinary.uploader.destroy(category.images.public_id);
            }

            const uploadimage = await uploadToCloudinary(
                image.buffer,
                `category/images/${slugify(category.categoryname)}`,
                image.mimetype,
                image.originalname
            );

            category.images = {
                url: uploadimage.secure_url,
                public_id: uploadimage.public_id
            };
        }

        await category.save();

        res.status(200).json({
            success: true,
            category
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deletecategory = async (req, res) => {
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
           2. DELETE IMAGE FROM CLOUDINARY
        ----------------------------------*/
        if (category.images?.public_id) {
            await cloudinary.uploader.destroy(category.images.public_id);
        }

        /* ---------------------------------
           3. DELETE CATEGORY FROM DATABASE
        ----------------------------------*/
        await ParentCategory.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Parent category deleted successfully",
        });

    } catch (error) {
        console.error("Delete Category Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
