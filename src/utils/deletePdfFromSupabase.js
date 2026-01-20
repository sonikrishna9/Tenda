const supabase = require("../../config/supabase.js");

const deletePdfFromSupabase = async (fileUrl) => {
  if (!fileUrl) return;

  const path = fileUrl.split("/storage/v1/object/public/product-pdfs/")[1];
  if (!path) return;

  await supabase.storage.from("product-pdfs").remove([path]);
};

module.exports = deletePdfFromSupabase;
