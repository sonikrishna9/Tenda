const SEO = require("../model/seo.model.js");
const slugify = require("../utils/slugify.js");

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

const buildSeoPayload = (payload = {}) => {
  const pageType = payload.pageType === "product" ? "product" : "static";

  if (payload.pageType === "singleProduct") {
    const parentCategory = normalizeText(payload.parentCategory);
    const productTitle = normalizeText(payload.productTitle);

    if (!parentCategory) {
      throw new Error("Parent category is required for single product SEO");
    }

    if (!productTitle) {
      throw new Error("Product is required for single product SEO");
    }

    return {
      ...payload,
      pageType: "singleProduct",
      entityType: "productDetail",
      slug: `product/${slugify(parentCategory)}/${slugify(productTitle)}`,
      pageLabel: `Single Product Page / ${parentCategory} / ${productTitle}`,
      parentCategory,
      subCategory: "",
      productTitle,
    };
  }

  if (pageType === "product") {
    const entityType =
      payload.entityType === "subCategory" ? "subCategory" : "parentCategory";
    const parentCategory = normalizeText(payload.parentCategory);
    const subCategory = normalizeText(payload.subCategory);

    if (!parentCategory) {
      throw new Error("Parent category is required for product SEO");
    }

    if (entityType === "subCategory" && !subCategory) {
      throw new Error("Subcategory is required for subcategory SEO");
    }

    const slug =
      entityType === "subCategory"
        ? `products/${slugify(parentCategory)}/${slugify(subCategory)}`
        : `products/${slugify(parentCategory)}`;

    const pageLabel =
      entityType === "subCategory"
        ? `Products / ${parentCategory} / ${subCategory}`
        : `Products / ${parentCategory}`;

    return {
      ...payload,
      pageType,
      entityType,
      slug,
      pageLabel,
      parentCategory,
      subCategory: entityType === "subCategory" ? subCategory : "",
      productTitle: "",
    };
  }

  const slug = normalizeText(payload.slug);

  if (!slug) {
    throw new Error("Slug is required");
  }

  return {
    ...payload,
    pageType: "static",
    entityType: "page",
    slug,
    pageLabel: normalizeText(payload.pageLabel) || slug,
    parentCategory: "",
    subCategory: "",
    productTitle: "",
  };
};

const sendError = (res, error) => {
  const message = error?.message || "Something went wrong";
  const status =
    message.includes("required") || message.includes("already exists") ? 400 : 500;

  return res.status(status).json({ message });
};

const createSEO = async (req, res) => {
  try {
    const seoPayload = buildSeoPayload(req.body);
    const exists = await SEO.findOne({ slug: seoPayload.slug });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "SEO already exists for this slug",
      });
    }

    const seo = new SEO(seoPayload);
    await seo.save();

    return res.json({
      success: true,
      message: "SEO created successfully",
      data: seo,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getAllSEO = async (req, res) => {
  try {
    const list = await SEO.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: list,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getSEOBySlug = async (req, res) => {
  try {
    const slug = normalizeText(req.query.slug || req.params.slug);
    const seo = await SEO.findOne({ slug });

    return res.json({
      success: true,
      data: seo || {},
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const updateSEO = async (req, res) => {
  try {
    const { id } = req.params;
    const seoPayload = buildSeoPayload(req.body);

    const duplicate = await SEO.findOne({
      slug: seoPayload.slug,
      _id: { $ne: id },
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "SEO already exists for this slug",
      });
    }

    const seo = await SEO.findByIdAndUpdate(id, seoPayload, {
      new: true,
    });

    if (!seo) {
      return res.status(404).json({
        success: false,
        message: "SEO not found",
      });
    }

    return res.json({
      success: true,
      message: "SEO updated successfully",
      data: seo,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const deleteSEO = async (req, res) => {
  try {
    const { id } = req.params;
    const seo = await SEO.findByIdAndDelete(id);

    if (!seo) {
      return res.status(404).json({
        success: false,
        message: "SEO not found",
      });
    }

    return res.json({
      success: true,
      message: "SEO deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSEO,
  getAllSEO,
  getSEOBySlug,
  updateSEO,
  deleteSEO,
};
