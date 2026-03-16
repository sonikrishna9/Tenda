const Company = require("../model/Company");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const cloudinary = require("../../config/cloudinary");

/* ================= CREATE COMPANY ================= */

exports.createCompany = async (req, res) => {
    try {

        const { companyName } = req.body;

        if (!companyName) {
            return res.status(400).json({
                success: false,
                message: "Company name is required",
            });
        }

        const existingCompany = await Company.findOne({ companyName });

        if (existingCompany) {
            return res.status(400).json({
                success: false,
                message: "Company already exists",
            });
        }

        let logo = {};

        if (req.file) {
            const uploaded = await uploadToCloudinary(
                req.file.buffer,
                "companies",
                req.file.mimetype,
                req.file.originalname
            );

            logo = {
                url: uploaded.secure_url,
                public_id: uploaded.public_id,
            };
        }

        const company = await Company.create({
            companyName,
            logo,
        });

        return res.status(201).json({
            success: true,
            message: "Company created successfully",
            company,
        });

    } catch (error) {

        console.error("CREATE COMPANY ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });

    }
};

/* ================= GET ALL COMPANIES ================= */

exports.getAllCompanies = async (req, res) => {
    try {

        const companies = await Company.find();

        return res.status(200).json({
            success: true,
            companies,
        });

    } catch (error) {

        console.error("GET COMPANIES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });

    }
};

/* ================= GET SINGLE COMPANY ================= */

exports.getCompany = async (req, res) => {
    try {

        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        return res.status(200).json({
            success: true,
            company,
        });

    } catch (error) {

        console.error("GET COMPANY ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });

    }
};

/* ================= UPDATE COMPANY ================= */

exports.updateCompany = async (req, res) => {
    try {

        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const { companyName, status } = req.body;

        /* ---------- UPDATE NAME ---------- */

        if (companyName) {
            company.companyName = companyName;
        }

        if (status) {
            company.status = status;
        }

        /* ---------- UPDATE LOGO ---------- */

        if (req.file) {

            // delete old logo from cloudinary
            if (company.logo?.public_id) {
                await cloudinary.uploader.destroy(company.logo.public_id);
            }

            // upload new logo
            const uploaded = await uploadToCloudinary(
                req.file.buffer,
                "companies",
                req.file.mimetype,
                req.file.originalname
            );

            company.logo = {
                url: uploaded.secure_url,
                public_id: uploaded.public_id,
            };
        }

        await company.save();

        return res.status(200).json({
            success: true,
            message: "Company updated successfully",
            company,
        });

    } catch (error) {

        console.error("UPDATE COMPANY ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });

    }
};

/* ================= DELETE COMPANY ================= */

exports.deleteCompany = async (req, res) => {
    try {

        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        /* ---------- DELETE LOGO FROM CLOUDINARY ---------- */

        if (company.logo?.public_id) {
            await cloudinary.uploader.destroy(company.logo.public_id);
        }

        /* ---------- DELETE COMPANY ---------- */

        await company.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Company deleted successfully",
        });

    } catch (error) {

        console.error("DELETE COMPANY ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });

    }
};