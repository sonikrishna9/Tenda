const ParentCategory = require("../model/parentcategorymodel.js");
const path = require("path");
const fs = require("fs");

/* ================= CREATE ================= */
exports.createparentcategory = async (req, res) => {
    try {
        const { categoryname, subcategories } = req.body;

        if (!categoryname) {
            return res.status(400).json({
                success: false,
                message: "Category name required",
            });
        }

        // parse subcategories
        let parsedSub = [];
        if (subcategories) {
            try {
                parsedSub = JSON.parse(subcategories);
                parsedSub = [...new Set(parsedSub)].map((name) => ({ name }));
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid subcategories format",
                });
            }
        }

        // IMAGE
        const image = req.files?.images?.[0];

        if (!image) {
            return res.status(400).json({
                success: false,
                message: "Image is required",
            });
        }

        const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

        const category = await ParentCategory.create({
            categoryname,
            subcategories: parsedSub,
            images: {
                url: `${BASE_URL}/uploads/products/images/${image.filename}`,
                public_id: image.filename, // local file name
            },
        });

        res.status(201).json({
            success: true,
            category,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/* ================= GET ================= */
exports.getcategory = async (req, res) => {
    try {
        const parentcategory = await ParentCategory.find();

        return res.status(200).json({
            success: true,
            parentcategory,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

/* ================= FRONTEND ================= */
exports.getfrontendcategory = async (req, res) => {
    try {
        const parentcategory = await ParentCategory.find({ status: true });

        return res.status(200).json({
            success: true,
            parentcategory,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

/* ================= UPDATE ================= */
exports.updatecategory = async (req, res) => {
    try {
        const category = await ParentCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        const { categoryname, subcategories, status } = req.body;

        if (typeof status !== "undefined") {
            category.status = status === "true" || status === true;
        }

        if (categoryname) {
            category.categoryname = categoryname.trim();
        }

        if (subcategories) {
            try {
                let parsedSub = JSON.parse(subcategories);
                parsedSub = [...new Set(parsedSub)].map((name) => ({ name }));
                category.subcategories = parsedSub;
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid subcategories format",
                });
            }
        }

        // IMAGE UPDATE
        const image = req.files?.images?.[0];

        if (image) {
            // delete old file
            if (category.images?.public_id) {
                const oldPath = path.join(
                    __dirname,
                    "../../public/uploads/products/images/",
                    category.images.public_id
                );

                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

            category.images = {
                url: `${BASE_URL}/uploads/products/images/${image.filename}`,
                public_id: image.filename,
            };
        }

        await category.save();

        res.status(200).json({
            success: true,
            category,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/* ================= DELETE ================= */
exports.deletecategory = async (req, res) => {
    try {
        const category = await ParentCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        // delete local file
        if (category.images?.public_id) {
            const filePath = path.join(
                __dirname,
                "../../public/uploads/products/images/",
                category.images.public_id
            );

            console.log("DELETE PATH:", filePath); // 👈 debug

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await ParentCategory.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error) {
        console.error("DELETE ERROR:", error); // 👈 IMPORTANT

        return res.status(500).json({
            success: false,
            message: error.message, // 👈 show real error
        });
    }
};