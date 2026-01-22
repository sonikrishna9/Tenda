const supabase = require("../../config/supabase.js");

/**
 * Supports:
 * 1️⃣ Single URL
 * 2️⃣ Single path
 * 3️⃣ Array of URLs
 * 4️⃣ Array of paths
 */
const deletePdfFromSupabase = async (input) => {
  if (!input) return;

  let paths = [];

  // 🔹 Case 1: Array
  if (Array.isArray(input)) {
    paths = input
      .map((item) => {
        // already a path
        if (item.startsWith("products/")) return item;

        // URL → extract path
        if (typeof item === "string" && item.includes("/storage/v1/object/public/product-pdfs/")) {
          return item.split("/storage/v1/object/public/product-pdfs/")[1];
        }

        return null;
      })
      .filter(Boolean);
  }

  // 🔹 Case 2: Single string
  else if (typeof input === "string") {
    if (input.startsWith("products/")) {
      paths = [input];
    } else if (input.includes("/storage/v1/object/public/product-pdfs/")) {
      paths = [
        input.split("/storage/v1/object/public/product-pdfs/")[1],
      ];
    }
  }

  if (!paths.length) return;

  const { error } = await supabase.storage
    .from("product-pdfs")
    .remove(paths);

  if (error) {
    console.error("❌ Supabase delete error:", error);
    throw error;
  }

  console.log("✅ Supabase files deleted:", paths);
};

module.exports = deletePdfFromSupabase;
