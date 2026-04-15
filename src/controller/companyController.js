const Company = require("../model/Company");
const path = require("path");
const fs = require("fs");

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

/* ================= CREATE ================= */
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

        let logo = null;

        if (req.files?.logo?.[0]) {
            const file = req.files.logo[0];

            logo = {
                url: `${BASE_URL}/uploads/products/images/${file.filename}`,
                public_id: file.filename,
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


/* ================= GET ALL ================= */
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


/* ================= GET SINGLE ================= */
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


/* ================= UPDATE ================= */
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

        if (companyName) company.companyName = companyName;
        if (status) company.status = status;

        /* 🔥 UPDATE LOGO */
        if (req.files?.logo?.[0]) {
            const file = req.files.logo[0];

            // delete old logo
            if (company.logo?.public_id) {
                const oldPath = path.join(
                    __dirname,
                    "../../public/uploads/products/images/",
                    company.logo.public_id
                );

                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            company.logo = {
                url: `${BASE_URL}/uploads/products/images/${file.filename}`,
                public_id: file.filename,
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
        });
    }
};


/* ================= DELETE ================= */
exports.deleteCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        // 🔥 delete logo
        if (company.logo?.public_id) {
            const filePath = path.join(
                __dirname,
                "../../public/uploads/products/images/",
                company.logo.public_id
            );

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

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
        });
    }
};